<?php

namespace backend\modules\v1\controllers;

use common\models\LoginForm;
use Yii;
use yii\rest\Controller;
use yii\web\Response;
use common\models\ApiLoginForm;

class AuthController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        // login должен быть доступен без токена
        unset($behaviors['authenticator']);
        return $behaviors;
    }

    public function actionLogin()
    {
        $form = new ApiLoginForm();
        Yii::$app->response->format = Response::FORMAT_JSON;

        $form = new LoginForm();
        $form->load(Yii::$app->request->post(), '');

        if (!$form->validate()) {
            Yii::$app->response->statusCode = 422;
            return ['errors' => $form->errors];
        }

        $user = $form->getUser();
        $token = Yii::$app->jwt->generate($user->id, $user->role);

        return [
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ];
    }
}