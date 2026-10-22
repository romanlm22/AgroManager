package com.agromanager.livestock;

import java.util.List;

public class DuplicateTagNumberException extends RuntimeException {

    private final List<String> tagNumbers;

    public DuplicateTagNumberException(List<String> tagNumbers) {
        super("Tag numbers already exist in this farm: " + String.join(", ", tagNumbers));
        this.tagNumbers = tagNumbers;
    }

    public List<String> getTagNumbers() {
        return tagNumbers;
    }
}
