<?php

class PasswordResetModel
{
    public function __construct(private PDO $db) {}

    public function create(int $userId, string $tokenHash, int $minutosValidez = 30): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO password_resets (usuario_id, token_hash, fecha_expiracion)
             VALUES (:usuario_id, :token_hash, DATE_ADD(NOW(), INTERVAL :minutos MINUTE))"
        );

        $stmt->bindValue('usuario_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue('token_hash', $tokenHash);
        $stmt->bindValue('minutos', $minutosValidez, PDO::PARAM_INT);
        $stmt->execute();
    }

    public function findValid(int $userId, string $tokenHash): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM password_resets
             WHERE usuario_id = :usuario_id
               AND token_hash = :token_hash
               AND usado = 0
               AND fecha_expiracion >= NOW()
             ORDER BY id DESC
             LIMIT 1"
        );

        $stmt->execute([
            'usuario_id' => $userId,
            'token_hash' => $tokenHash,
        ]);

        return $stmt->fetch() ?: null;
    }

    public function markUsed(int $id): void
    {
        $stmt = $this->db->prepare("UPDATE password_resets SET usado = 1 WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}