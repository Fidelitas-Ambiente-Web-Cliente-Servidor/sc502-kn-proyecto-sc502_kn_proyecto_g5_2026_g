<?php

class Controller
{
    protected function render(string $view, array $data = []): void
    {
        extract($data, EXTR_SKIP);
        $pageTitle = $data['pageTitle'] ?? 'DengueReporte CR';

        require APP_PATH . '/views/layouts/header.php';
        require APP_PATH . '/views/' . $view . '.php';
        require APP_PATH . '/views/layouts/footer.php';
    }

    protected function redirect(string $controller, string $action = 'index', array $params = []): never
    {
        header('Location: ' . url($controller, $action, $params));
        exit;
    }

    protected function saveImage(array $file, string $folder): ?string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            throw new RuntimeException('No se pudo cargar la imagen.');
        }

        if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
            throw new RuntimeException('La imagen no puede superar 5 MB.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        if (!isset($allowed[$mime])) {
            throw new RuntimeException('Formato de imagen no permitido. Use JPG, PNG o WEBP.');
        }

        $directory = PUBLIC_PATH . '/uploads/' . trim($folder, '/');
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException('No fue posible crear la carpeta de evidencias.');
        }

        $name = bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
        $relative = 'uploads/' . trim($folder, '/') . '/' . $name;
        $destination = PUBLIC_PATH . '/' . $relative;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new RuntimeException('No fue posible guardar la imagen en el servidor.');
        }

        return $relative;
    }
}
