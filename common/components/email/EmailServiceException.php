<?php

namespace common\components\email;

use yii\base\Exception;

/**
 * Выбрасывается при любой ошибке взаимодействия с Email Service:
 * сетевой сбой, таймаут, невалидный ответ или success=false в теле ответа.
 */
class EmailServiceException extends Exception
{
    public function getName(): string
    {
        return 'Email Service Error';
    }
}