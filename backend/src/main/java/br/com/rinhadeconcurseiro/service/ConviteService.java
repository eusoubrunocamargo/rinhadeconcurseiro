package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.ConviteResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.entity.ConviteDuelo;
import br.com.rinhadeconcurseiro.entity.Duelo;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.StatusConvite;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.ConviteDueloRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConviteService {

    private final ConviteDueloRepository conviteDueloRepository;
    private final DueloRepository dueloRepository;
    private final UsuarioRepository usuarioRepository;
    private final DueloMapper dueloMapper;
    private final SimpMessagingTemplate messagingTemplate;

    // TTL do convite definido como constante — fácil de ajustar no futuro
    private static final int CONVITE_TTL_MINUTOS = 10;

    @Transactional
    public ConviteResponse enviar(Usuario remetente, String emailDestinatario) {
//        System.out.println(">>> emails comparados: ["
//        + remetente.getEmail() + "] vs [" + emailDestinatario + "]");
        // Regra 1: um usuário não pode se autoconvidar.
        // Verificamos pelo email antes mesmo de buscar no banco.
        if (remetente.getEmail().equalsIgnoreCase(emailDestinatario)) {
            throw new DueloException("Você não pode se convidar para um duelo.");
        }

        // Regra 2: o destinatário precisa estar cadastrado na plataforma.
        Usuario destinatario = usuarioRepository.findByEmail(emailDestinatario)
                .orElseThrow(() -> new DueloException("Nenhum usuário encontrado com esse e-mail."));

        // Regra 3: não pode existir convite pendente e ainda válido entre os dois.
        // Usamos a query que filtra por status E por expiração para não bloquear
        // casos onde o convite anterior já expirou naturalmente.
        boolean convitePendenteAtivo = conviteDueloRepository
                .existsPendenteValido(
                        remetente.getId(),
                        destinatario.getId(),
                        StatusConvite.PENDENTE
                        );

        if (convitePendenteAtivo) {
            throw new DueloException("Você já tem um convite pendente para este usuário.");
        }

        // Tudo certo — cria o convite.
        // O UUID é gerado aqui no Java para que possamos retorná-lo imediatamente,
        // sem precisar fazer um SELECT após o INSERT.
        ConviteDuelo convite = ConviteDuelo.builder()
                .token(UUID.randomUUID())
                .remetente(remetente)
                .destinatario(destinatario)
                .status(StatusConvite.PENDENTE)
                .expiresAt(LocalDateTime.now().plusMinutes(CONVITE_TTL_MINUTOS))
                .build();

        ConviteResponse response = dueloMapper.toConviteResponse(conviteDueloRepository.save(convite));

        // publica para o destinatário via fila pessoal
        // spring resolve "/user/{destinatario.getId()}/queue/convites"
        // e entrega apenas para a sessão WS autenticada com esse ID
        messagingTemplate.convertAndSendToUser(
                destinatario.getId().toString(),
                "/queue/convites",
                response
        );

        return response;
    }

    @Transactional(readOnly = true)
    public ConviteResponse buscarPorToken(UUID token, Usuario solicitante) {

        ConviteDuelo convite = conviteDueloRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));

        // Segurança: apenas o destinatário pode visualizar os detalhes do convite.
        // Isso impede que qualquer usuário logado que descubra um UUID veja
        // informações de convites alheios.
        if (!convite.getDestinatario().getId().equals(solicitante.getId())) {
            throw new DueloException("Você não tem permissão para acessar este convite.");
        }

        return dueloMapper.toConviteResponse(convite);
    }

    @Transactional
    public DueloResponse aceitar(UUID token, Usuario solicitante) {

        // Buscamos o convite com lock pessimista para evitar race condition:
        // dois cliques simultâneos no botão "aceitar" não devem criar dois duelos.
        ConviteDuelo convite = conviteDueloRepository.findByTokenWithLock(token)
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));

        // Verificação de ownership — só o destinatário aceita
        if (!convite.getDestinatario().getId().equals(solicitante.getId())) {
            throw new DueloException("Este convite não é para você.");
        }

        // Verificação de validade — delega para o método utilitário da entidade
        if (!convite.isValido()) {
            // Se expirou, atualizamos o status para refletir a realidade
            if (convite.getStatus() == StatusConvite.PENDENTE) {
                convite.setStatus(StatusConvite.EXPIRADO);
                conviteDueloRepository.save(convite);
            }
            throw new DueloException("Este convite já expirou ou não está mais disponível.");
        }

        // Transição de estado do convite — registra o momento exato
        convite.setStatus(StatusConvite.ACEITO);
        convite.setUsadoEm(LocalDateTime.now());
        conviteDueloRepository.save(convite);

        // Cria o duelo — o remetente do convite sempre começa como host
        Duelo duelo = Duelo.builder()
                .convite(convite)
                .host(convite.getRemetente())
                .desafiado(convite.getDestinatario())
                .status(StatusDuelo.CONFIGURANDO)
                .build();

        return dueloMapper.toDueloResponse(dueloRepository.save(duelo));
    }

    // ConviteService.java — adicionar:
    @Transactional
    public List<ConviteResponse> listarPendentes(Usuario usuario) {
        List<ConviteDuelo> todos = conviteDueloRepository
                .findByDestinatarioIdAndStatus(usuario.getId(), StatusConvite.PENDENTE);

        // Separa válidos dos expirados
        List<ConviteDuelo> expirados = todos.stream()
                .filter(c -> !c.isValido())
                .toList();

        // Atualiza status dos expirados no banco
        expirados.forEach(c -> {
            c.setStatus(StatusConvite.EXPIRADO);
            conviteDueloRepository.save(c);
        });

        // Retorna apenas os válidos
        return todos.stream()
                .filter(ConviteDuelo::isValido)
                .map(dueloMapper::toConviteResponse)
                .toList();
    }

    @Transactional
    public void recusar(UUID token, Usuario solicitante){
        ConviteDuelo convite = conviteDueloRepository.findByTokenWithLock(token)
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));

        if(!convite.getDestinatario().getId().equals(solicitante.getId()))
            throw new DueloException("Este convite não é para você.");

        if(!convite.isValido())
            throw new DueloException("Este convite já expirou ou não está mais disponível.");

        convite.setStatus(StatusConvite.RECUSADO);
        convite.setUsadoEm(LocalDateTime.now());
        conviteDueloRepository.save(convite);
    }

    public Optional<ConviteResponse> buscarConviteEnviado(Usuario usuario){
        return conviteDueloRepository
                .findByRemetenteIdAndStatus(usuario.getId(), StatusConvite.PENDENTE)
                .filter(ConviteDuelo::isValido)
                .map(dueloMapper::toConviteResponse);
    }

}
