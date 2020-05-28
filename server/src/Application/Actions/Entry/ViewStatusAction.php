<?php
declare(strict_types=1);

namespace App\Application\Actions\Entry;

use Psr\Http\Message\ResponseInterface as Response;

class ViewStatusAction extends EntryAction
{
    /**
     * {@inheritdoc}
     */
    protected function action(): Response
    {
        $result = $this->db->getStatus();
        $this->logger->info("Viewing status.");
        
        return $this->respondWithData($result);
    }
}
