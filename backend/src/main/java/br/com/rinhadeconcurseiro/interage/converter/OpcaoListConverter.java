package br.com.rinhadeconcurseiro.interage.converter;

import br.com.rinhadeconcurseiro.interage.dto.OpcaoDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class OpcaoListConverter implements AttributeConverter<List<OpcaoDto>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<OpcaoDto> attribute) {
        if(attribute == null) return null;
        try {
            return mapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Erro ao converter para JSON (serializer)", e);
        }
    }

    @Override
    public List<OpcaoDto> convertToEntityAttribute(String dbData) {
        if(dbData == null) return null;
        try {
            return mapper.readValue(dbData, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Erro ao converter de JSON (deserializer)", e);
        }
    }


}
