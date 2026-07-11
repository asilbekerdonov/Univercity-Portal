<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

class Faculty extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%faculties}}';
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::class,
        ];
    }

    public function rules()
    {
        return [
            [['name', 'slug'], 'required'],
            [['name', 'slug'], 'string', 'max' => 255],
            ['slug', 'unique'],
            ['slug', 'match', 'pattern' => '/^[a-z0-9-]+$/', 'message' => 'Slug может содержать только строчные латинские буквы, цифры и дефис.'],
            ['description', 'string'],
            ['sort_order', 'integer'],
            ['sort_order', 'default', 'value' => 0],
            ['is_active', 'boolean'],
            ['is_active', 'default', 'value' => true],
        ];
    }

    public function fields()
    {
        return ['id', 'name', 'slug', 'description', 'sort_order', 'is_active'];
    }
    
    public function getStudents()
    {
        return $this->hasMany(Student::class, ['faculty_id' => 'id']);
    }
}