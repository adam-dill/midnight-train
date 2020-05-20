<?php
declare(strict_types=1);

namespace App\Application\Actions\Entry;

use Psr\Http\Message\ResponseInterface as Response;

class ViewLimitedEntryAction extends EntryAction
{
    /**
     * {@inheritdoc}
     */
    protected function action(): Response
    {
        $offset = $this->resolveArg('offset');
        $limit = $this->resolveArg('limit');
        $result = $this->db->getEntries($offset, $limit);
        $this->logger->info("Viewing limited entries.");
        
        return $this->respondWithData($result);
    }
}
