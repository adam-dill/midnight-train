<?php
declare(strict_types=1);

use App\Application\Actions\Entry\ViewEntryAction;
use App\Application\Actions\Entry\PostEntryAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

return function (App $app) {
    $app->get('/', function (Request $request, Response $response) {
        $file = '../public/index.html';
        if (file_exists($file)) {
            $response->getBody()->write(file_get_contents($file));
            return $response;
        } else {
            throw new \Slim\Exception\NotFoundException($request, $response);
        }
    });

    $app->group('/entries', function (Group $group) {
        $group->get('', ViewEntryAction::class);
        $group->post('/add', PostEntryAction::class);
    });
};
