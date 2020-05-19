<?php
declare(strict_types=1);

namespace App\Application\Actions\Entry;

use Psr\Http\Message\ResponseInterface as Response;

class PostEntryAction extends EntryAction
{
    /**
     * {@inheritdoc}
     */
    protected function action(): Response
    {
        $body = $this->request->getBody()->getContents();
        $obj = json_decode($body);
        $result = $this->db->postEntry($obj);
        $this->logger->info("Posting entry.");
        
        return $this->respondWithData($result);
    }
}
