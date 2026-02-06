package br.com.rinhadeconcurseiro.exception;

public class ApelidoExistenteException extends RuntimeException {
    public ApelidoExistenteException(String message) {
        super("Apelido já existe: " + message);
    }
}
