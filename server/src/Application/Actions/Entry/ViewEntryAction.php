<?php
declare(strict_types=1);

namespace App\Application\Actions\Entry;

use Psr\Http\Message\ResponseInterface as Response;

class ViewEntryAction extends EntryAction
{
    /**
     * {@inheritdoc}
     */
    protected function action(): Response
    {
        $result = $this->db->getEntries();
        $this->logger->info("Viewing all entries.");
        
        return $this->respondWithData($result);
    }
}
