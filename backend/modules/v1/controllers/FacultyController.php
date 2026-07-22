<?php

namespace backend\modules\v1\controllers;

use common\models\Faculty;
use common\models\Student;
use common\models\User;
use Yii;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors; // ✅ Добавить импорт
use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class FacultyController extends ActiveController
{
    public $modelClass = 'common\models\Faculty';

    // ✅ ДОБАВИТЬ BEHAVIORS
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        
        // CORS должен быть ПЕРЕД аутентификацией
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => [
                    'http://localhost:3100',
                    'http://localhost:5173',
                    'http://frontend:3000',
                ],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
            ],
        ];
        
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
        ];
        
        return $behaviors;
    }
  

    public function actions()
    {
        $actions = parent::actions();
        // Используем свою логику для create/update/delete с проверкой роли
        unset($actions['create'], $actions['update'], $actions['delete']);
        return $actions;
    }

    protected function checkCanDelete(): void
    {
        $identity = Yii::$app->user->identity;
        $allowedRoles = [User::ROLE_SUPER_ADMIN, User::ROLE_SUPERVISOR];

        if (!$identity || !in_array($identity->role, $allowedRoles, true)) {
            throw new ForbiddenHttpException('Недостаточно прав для удаления факультета.');
        }
    }

    public function actionCreate()
    {
        $this->checkSuperAdmin();

        $model = new Faculty();
        $model->load(Yii::$app->request->post(), '');

        if ($model->save()) {
            Yii::$app->response->statusCode = 201;
            return $model;
        }

        Yii::$app->response->statusCode = 422;
        return ['errors' => $model->errors];
    }

    public function actionUpdate($id)
    {
        $this->checkSuperAdmin();

        $model = Faculty::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['message' => 'Факультет не найден.'];
        }

        $model->load(Yii::$app->request->getBodyParams(), '');

        if ($model->save()) {
            return $model;
        }

        Yii::$app->response->statusCode = 422;
        return ['errors' => $model->errors];
    }

    public function actionDelete($id)
    {
        $this->checkSuperAdmin();

        $model = Faculty::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['message' => 'Факультет не найден.'];
        }

        $model->delete();
        Yii::$app->response->statusCode = 204;
    }
    public function actionStudents($id)
    {
        $faculty = Faculty::findOne($id);

        if (!$faculty) {
            Yii::$app->response->statusCode = 404;
            return ['message' => 'Факультет не найден.'];
        }

        return Student::find()
            ->where(['faculty_id' => $faculty->id])
            ->all();
    }
    protected function checkSuperAdmin(): void
{
    $identity = Yii::$app->user->identity;
    if (!$identity || $identity->role !== User::ROLE_SUPER_ADMIN) {
        throw new ForbiddenHttpException('Недостаточно прав. Требуется роль супер-администратора.');
    }
}
}