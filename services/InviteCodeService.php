<?php
namespace Services;

class InviteCodeService
{
    private const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    /**
     * Generate a random invite code of 6-8 characters using allowed charset.
     */
    public function generate(): string
    {
        $length = random_int(6, 8);
        $characters = self::CHARSET;
        $code = '';
        $maxIndex = strlen($characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $maxIndex)];
        }
        return $code;
    }
}
