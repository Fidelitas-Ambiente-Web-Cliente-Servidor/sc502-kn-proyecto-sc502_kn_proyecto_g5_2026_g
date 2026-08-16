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

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT u.*, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON r.id = u.rol_id
             WHERE u.id = :id
             LIMIT 1"
        );

        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return (bool)$stmt->fetch();
    }

    public function create(string $nombre, string $email, string $password): int
    {
        // rol_id = 1 corresponde a 'ciudadano' (ver sql/schema.sql, INSERT INTO roles).
        $stmt = $this->db->prepare(
            "INSERT INTO usuarios (nombre, email, contrasena_hash, rol_id, activo, disponible)
             VALUES (:nombre, :email, :hash, 1, 1, 0)"
        );

        $stmt->execute([
            'nombre' => $nombre,
            'email' => $email,
            'hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function updatePassword(int $id, string $password): void
    {
        $stmt = $this->db->prepare(
            "UPDATE usuarios SET contrasena_hash = :hash WHERE id = :id"
        );

        $stmt->execute([
            'hash' => password_hash($password, PASSWORD_DEFAULT),
            'id' => $id,
        ]);
    }
}