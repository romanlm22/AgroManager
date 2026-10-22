package com.agromanager.auth;

import com.agromanager.user.Role;

/** El rol pedido en el registro no se puede elegir por cuenta propia (por ejemplo, ADMIN). */
public class RoleNotAllowedException extends RuntimeException {

    public RoleNotAllowedException(Role role) {
        super("Role not allowed for self-registration: " + role);
    }
}
