<?php


if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

class Database {
    private static $instance = null;
    private $connection;
    
    private $host = 'localhost';
    private $dbname = 'event_platform';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    
    private function __construct() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_CASE => PDO::CASE_NATURAL
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
        
            
        } catch (PDOException $e) {
            error_log("Erreur de connexion à la base de données: " . $e->getMessage());
            throw new Exception("Erreur de connexion à la base de données");
        }
    }
    
    private function __clone() {}
    
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
    
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection(): PDO {
        return $this->connection;
    }
    
    public function query(string $sql, array $params = []): PDOStatement {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    public function fetchOne(string $sql, array $params = []) {
        return $this->query($sql, $params)->fetch();
    }
    
    public function fetchAll(string $sql, array $params = []): array {
        return $this->query($sql, $params)->fetchAll();
    }
    
    public function callProcedure(string $procedure, array $params = [], array $outParams = []): array {
        $placeholders = array_fill(0, count($params), '?');
        $outPlaceholders = array_map(fn($p) => "@$p", $outParams);
        
        $allPlaceholders = array_merge($placeholders, $outPlaceholders);
        $sql = "CALL $procedure(" . implode(', ', $allPlaceholders) . ")";
        
        $this->query($sql, $params);
        
        $result = [];
        if (!empty($outParams)) {
            $outSelect = implode(', ', array_map(fn($p) => "@$p AS $p", $outParams));
            $result = $this->fetchOne("SELECT $outSelect");
        }
        
        return $result;
    }
    
    public function lastInsertId(): string {
        return $this->connection->lastInsertId();
    }
    
    public function beginTransaction(): bool {
        return $this->connection->beginTransaction();
    }
    
    public function commit(): bool {
        return $this->connection->commit();
    }
    
    public function rollback(): bool {
        return $this->connection->rollBack();
    }
}

function getDB(): PDO {
    return Database::getInstance()->getConnection();
}

function db(): Database {
    return Database::getInstance();
}