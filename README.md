# openHAB Yandex Smart Home Connector

Мост из Яндекс УД в openHAB на Node.js
Мой сайт и мои контакты там: http://knopkadom.ru

Работает: Вкл, Выкл, Яркость, Цвет.
Пока не поддерживается управление температурой и медиа техникой.

Для работы навыка необходимо иметь рабочую учетную запись на https://myopenhab.org. А для этого надо иметь установленный умный дом openHAB.

## Настройка openHAB:

1. Добавить тег [ "Room" ] группам с комнатами, они автоматически добавятся в Яндекс.
2. Добавить теги [ "Lighting" ] или [ "Switchable" ] к устройствам, которые будут управляться Яндекс.

### Есть официальный опубликованный навык openHAB cloud KnopkaDom.ru

## Подключение навыка:

1. Открываете приложение Яндекс на смартфоне.
2. В зависимости от системы: Android - Нажать Квадратики. iOS - Нажать Три полоски или бургер.
3. Устройства - Умный дом - Плюсик - Добавить Устройство - openHAB cloud KnopkaDom.ru - Объединить аккаунты.
4. Ввести пользователя и пароль от учетной записи myopenhab.org. ВНИМАНИЕ! Это не является абсолютно безопасным. Делайте это на свой страх и риск.
5. Нажать кнопку Разрешить.
6. Обновить список устройств.

## Установка

Настраиваем репозиторий Node JS

curl -sL https://deb.nodesource.com/setup_10.x | bash -

Устанавливаем необходимые компоненты

apt-get install -y nodejs git make g++ gcc build-essential

Копируем файлы

git clone https://github.com/vadim121283/openhab-yandex.git /opt/openhab-yandex

Задаём права.

chown -R root:root /opt/openhab-yandex

Заходим в директорию и запускаем установку

cd /opt/openhab-yandex

npm install


Установите MongoDB (если возникает ошибка, возьмите версию 4):
Debian: https://baks.dev/article/debian/how-to-install-mongodb-on-debian-10-linux
CentOS: https://www.8host.com/blog/ustanovka-mongodb-v-centos-7/

Запускаем мост (Перед запуском мост нужно настроить)
npm start


## Автозапуск

В папке /etc/systemd/system/ создайте файл openhabyandex.service и впишите в него:

[Unit]
Description=yandex2mqtt
After=network.target

[Service]
ExecStart=/usr/bin/npm start

WorkingDirectory=/opt/openhab-yandex

StandardOutput=inherit

StandardError=inherit

Restart=always

User=root


[Install]
WantedBy=multi-user.target

Для включения сервиса впишите в консоль:

systemctl enable openhabyandex.service

После этого можно управлять командами:

service openhabyandex start

service openhabyandex stop

service openhabyandex restart

## Настройка

Для работы моста необходим валидный ssl сертификат. Если нет своего домена и белого IP адреса можно воспользоваться Dynamic DNS сервисами. (на пример noip.com). Для получения сертификата можно воспользоваться приложением certbot.
Все основные настройки моста прописываются в файл config.js. Перед запуском обязательно отредактируйте настройки.

## Создание своего навыка

URL авторизации: https://вашдомен/dialog/authorize
После запуска откроется окно авторизации "ВВЕДИТЕ УЧЕТНЫЕ ДАННЫЕ С MYOPENHAB.ORG"

URL для получения токена: https://вашдомен/oauth/token

Заходим на https://dialogs.yandex.ru/developer/skills => Создать диалог => Умный дом

Название: Любое
Endpoint URL: https://вашдомен/provider
Ставим галку "Не показывать в каталоге"
Имя разработчика: Ваше имя
Нажимаем "Добавить новую" связку
Название: Любое
Идентификатор и секрет : можно добавить в базе данных MongoDB см. модель.

Сохраняем связку и выбираем её в навыке. Выбираем иконку, пишем описание, нажимаем "Сохранить".
Дальше жмём "На модерацию" и сразу "Опубликовать". Готово.
Навык появится в приложении Яндекс в разделе "Устройства" => умный дом.
Свяжите аккаунты и обновите список устройств. После этого устройства будут доступны для управления через Алису.
