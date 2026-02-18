package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.SimuladoDetalheResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoQuestaoResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoResumoResponse;
import br.com.rinhadeconcurseiro.entity.Simulado;
import br.com.rinhadeconcurseiro.entity.SimuladoQuestao;
import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import br.com.rinhadeconcurseiro.mapper.SimuladoMapper;
import br.com.rinhadeconcurseiro.repository.SimuladoQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.SimuladoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SimuladoService {

    private final SimuladoRepository simuladoRepository;
    private final SimuladoQuestaoRepository simuladoQuestaoRepository;
    private final SimuladoMapper simuladoMapper;

    /**
     * Lista todos os simulados disponíveis (data <= hoje).
     */
    public List<SimuladoResumoResponse> listarDisponiveis() {
        LocalDate hoje = LocalDate.now();
        List<Simulado> simulados = simuladoRepository
                .findByDataDisponivelLessThanEqualAndAtivoTrueOrderByNumeroAsc(hoje);
        return simuladoMapper.toResumoResponseList(simulados);
    }

    /**
     * Lista TODOS os simulados ativos (disponíveis e futuros), ordenados por número.
     * O frontend decide o que exibir baseado na data.
     */
    public List<SimuladoResumoResponse> listarTodos() {
        List<Simulado> simulados = simuladoRepository
                .findByAtivoTrueOrderByNumeroAsc();
        return simuladoMapper.toResumoResponseList(simulados);
    }

    /**
     * Busca o simulado do dia atual.
     */
    public SimuladoResumoResponse buscarSimuladoHoje() {
        LocalDate hoje = LocalDate.now();
        Simulado simulado = simuladoRepository
                .findByDataDisponivelAndAtivoTrue(hoje)
                .orElseThrow(() -> new EntityNotFoundException("Não há simulado disponível para hoje"));
        return simuladoMapper.toResumoResponse(simulado);
    }

    /**
     * Busca simulado por ID.
     */
    public SimuladoResumoResponse buscarPorId(Long id) {
        Simulado simulado = simuladoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Simulado não encontrado: " + id));
        return simuladoMapper.toResumoResponse(simulado);
    }

    /**
     * Busca simulado por ID com todas as questões.
     */
    public SimuladoDetalheResponse buscarComQuestoes(Long id) {
        Simulado simulado = simuladoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Simulado não encontrado: " + id));

        List<SimuladoQuestao> questoes = simuladoQuestaoRepository
                .findBySimuladoIdOrderByOrdemAsc(id);

        return simuladoMapper.toDetalheResponse(simulado, questoes);
    }

    /**
     * Busca apenas as questões de um simulado.
     */
    public List<SimuladoQuestaoResponse> buscarQuestoes(Long simuladoId) {
        // Verifica se simulado existe
        if (!simuladoRepository.existsById(simuladoId)) {
            throw new EntityNotFoundException("Simulado não encontrado: " + simuladoId);
        }

        List<SimuladoQuestao> questoes = simuladoQuestaoRepository
                .findBySimuladoIdOrderByOrdemAsc(simuladoId);

        return simuladoMapper.toQuestaoResponseList(questoes);
    }

    /**
     * Busca questões de um simulado filtradas por caderno.
     */
    public List<SimuladoQuestaoResponse> buscarQuestoesPorCaderno(Long simuladoId, CadernoTipo caderno) {
        // Verifica se simulado existe
        if (!simuladoRepository.existsById(simuladoId)) {
            throw new EntityNotFoundException("Simulado não encontrado: " + simuladoId);
        }

        List<SimuladoQuestao> questoes = simuladoQuestaoRepository
                .findBySimuladoIdAndCadernoOrderByOrdemAsc(simuladoId, caderno);

        return simuladoMapper.toQuestaoResponseList(questoes);
    }

    /**
     * Busca o próximo simulado (primeiro com data > hoje).
     */
    public SimuladoResumoResponse buscarProximoSimulado() {
        LocalDate hoje = LocalDate.now();
        Simulado simulado = simuladoRepository
                .findFirstByDataDisponivelGreaterThanAndAtivoTrueOrderByDataDisponivelAsc(hoje)
                .orElseThrow(() -> new EntityNotFoundException("Não há próximo simulado agendado"));
        return simuladoMapper.toResumoResponse(simulado);
    }

    /**
     * Conta total de simulados ativos.
     */
    public long contarSimuladosAtivos() {
        return simuladoRepository.countByAtivoTrue();
    }
}