<?php
declare(strict_types=1);

use App\Domain\User\UserRepository;
use App\Infrastructure\Persistence\User\InMemoryUserRepository;
use App\Domain\Game\GameRepository;
use App\Infrastructure\Persistence\Game\InMemoryGameRepository;
use App\Infrastructure\Persistence\Game\MySQLGameRepository;
use DI\ContainerBuilder;

return function (ContainerBuilder $containerBuilder) {
    // Here we map our Repository interface to its in memory implementation
    $containerBuilder->addDefinitions([
        UserRepository::class => \DI\autowire(InMemoryUserRepository::class),
        GameRepository::class => \DI\autowire(MySQLGameRepository::class),
    ]);
};
