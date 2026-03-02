package br.com.rinhadeconcurseiro.dto.request;

import jakarta.validation.Valid;

import java.util.List;

/**
 * Body opcional do endpoint PUT /finalizar.
 *
 * <p>Permite que o frontend envie o último lote de respostas junto com
 * a finalização, tornando salvar + finalizar uma operação atômica e
 * eliminando a race condition entre duas chamadas separadas.</p>
 *
 * <p>Quando {@code respostas} é nulo ou vazio, o endpoint finaliza
 * usando apenas as respostas já persistidas anteriormente.</p>
 */
public record FinalizarRequest(
        @Valid
        List<RespostaRequest> respostas
) {
    /** Retorna true se há respostas a persistir antes de finalizar. */
    public boolean temRespostas() {
        return respostas != null && !respostas.isEmpty();
    }
}
