<?php

class UserModel
{
    public function __construct(private PDO $db) {}

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT u.*, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON r.id = u.rol_id
             WHERE u.email = :email
             LIMIT 1"
        );

        $stmt->execute(['email' => $email]);
        return $stmt->fetch() ?: null;
    }
}
