package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.response.AssuntoResponse;
import br.com.rinhadeconcurseiro.dto.response.MateriaResponse;
import br.com.rinhadeconcurseiro.service.AssuntoService;
import br.com.rinhadeconcurseiro.service.MateriaService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materias")
@RequiredArgsConstructor
public class MateriaController {

    private final MateriaService materiaService;
    private final AssuntoService assuntoService;

    @GetMapping
    public ResponseEntity<@NonNull List<MateriaResponse>> listarMaterias() {
        return ResponseEntity.ok(materiaService.listarAtivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<@NonNull MateriaResponse> buscarMateria(@PathVariable Long id) {
        return ResponseEntity.ok(materiaService.buscarPorId(id));
    }

    @GetMapping("/{id}/assuntos")
    public ResponseEntity<@NonNull List<AssuntoResponse>> listarAssuntos(@PathVariable Long id) {
        return ResponseEntity.ok(assuntoService.listarPorMateria(id));
    }
}
