let express = require('express');
let app = express();
let cookieParser = require('cookie-parser');
let admin = require('./admin');


/**
 * public - имя папки где хранится статика
 */
app.use(express.static('public'));
/**
 *  задаем шаблонизатор
 */
app.set('view engine', 'pug');
/**
* Подключаем mysql модуль
*/
let mysql = require('mysql');
/**
* настраиваем модуль
*/
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

const nodemailer = require('nodemailer');
const multer  = require("multer");

let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '141928',
  database: 'market'
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


app.listen(3000, function () {
  console.log('node express work on 3000');
});

app.use(function (req, res, next) {
  if (req.originalUrl == '/admin' || req.originalUrl == '/admin-order') {
    admin(req, res, con, next);
  }
  else {
    next();
  }
});

app.get('/', function (req, res) {
  res.render('main');
});

app.get('/news', function (req, res) {
  con.query("SELECT * FROM news", function(error, result){
      if (error) return reject(error);
      let news = {};
      for (let i = 0; i < result.length; i++){
          news[result[i]['id']] = result[i];
      }
      console.log(news);
  res.render('news', {
      news: JSON.parse(JSON.stringify(news))
  });
  })
});

app.get('/contacts', function (req, res) {
  res.render('contacts');
});

app.get('/payment', function (req, res) {
  res.render('payment')   
  });

app.get('/catalog', function (req, res) {
  let cat = new Promise(function (resolve, reject) {
    con.query(
      "select id, name, cost, image, category from (select id, name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  let catDescription = new Promise(function (resolve, reject) {
    con.query(
      "SELECT * FROM category",
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  Promise.all([cat, catDescription]).then(function (value) {
    console.log(value[1]);
    res.render('catalog', {
      goods: JSON.parse(JSON.stringify(value[0])),
      cat: JSON.parse(JSON.stringify(value[1])),
    });
  });
});

app.get('/cat', function (req, res) {
  console.log(req.query.id);
  let catId = req.query.id;

  let cat = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM category WHERE id=' + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });
  let goods = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM goods WHERE category=' + catId,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, goods]).then(function (value) {
    console.log(value[0]);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1]))
    });
  })
});

app.get('/goods', function (req, res) {
  console.log('work');
  console.log(req.params);
  con.query('SELECT * FROM goods WHERE id=' + req.query.id, function (error, result, fields) {
    if (error) throw error;
    console.log(result);
    result = JSON.parse(JSON.stringify(result));
    console.log(result[0]['id']);
    con.query('SELECT * FROM images WHERE goods_id=' + result[0]['id'], function (error, goodsImages, fields) {
      if (error) throw error;
      console.log(goodsImages);
      goodsImages = JSON.parse(JSON.stringify(goodsImages));
      res.render('goods', { goods: result, goods_images: goodsImages });
    });
  });
});

app.get('/order', function (req, res) {
  res.render('order');
});


app.post('/get-category-list', function (req, res) {
  // console.log(req.body);
  con.query('SELECT id, category FROM category', function (error, result, fields) {
    if (error) throw error;
    console.log(result)
    res.json(result);
  });
});

app.post('/get-goods-info', function (req, res) {
  console.log(req.body.key);
  if (req.body.key.length != 0) {
    con.query('SELECT id,name,cost FROM goods WHERE id IN (' + req.body.key.join(',') + ')', function (error, result, fields) {
      if (error) throw error;
      console.log(result);
      let goods = {};
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i];
      }
      res.json(goods);
    });
  }
  else {
    res.send('0');
  }
});

app.post('/finish-order', function (req, res) {
  console.log(req.body);
  if (req.body.key.length != 0) {
    let key = Object.keys(req.body.key);
    con.query(
      'SELECT id,name,cost FROM goods WHERE id IN (' + key.join(',') + ')',
      function (error, result, fields) {
        if (error) throw error;
        console.log(result);
        sendMail(req.body, result).catch(console.error);
        saveOrder(req.body, result);
        res.send('1');
      });
  }
  else {
    res.send('0');
  }
});


app.get('/admin', function (req, res) {
  res.render('admin', {});
});

app.get('/admin-goods', function (req, res){
  con.query("SELECT * FROM goods", function(error, result){
      if (error) return reject(error);
      let goods = {};
      for (let i = 0; i < result.length; i++){
          goods[result[i]['id']] = result[i];
      }
  con.query("SELECT * FROM category", function(error, result){
      if (error) return reject(error);
      let category = {};
      for (let i = 0; i < result.length; i++){
          category[result[i]['id']] = result[i];
      }
      console.log(goods);
      console.log(category);
  res.render('admin-goods', {
      goods: JSON.parse(JSON.stringify(goods))
    });
   })
 });
});

app.post("/admin-goods", function (req, res) {
    if(!req.body) return res.sendStatus(400);
    const name = req.body.name;
    const description = req.body.description;
    const cost = req.body.cost;
    const image = req.body.image;
    const category = req.body.category;
    con.query("INSERT INTO goods (name, description, cost, image, category) VALUES (?,?,?,?,?)", [name, description, cost, image, category], function(err, data) {
      if(err) return console.log(err);
      res.redirect("/admin-goods");
    });
});

app.get("/admin-goods-edit/:id", function(req, res){
  const id = req.params.id;
  con.query("SELECT * FROM goods WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
     res.render("admin-goods-edit", {
        goods: data[0]
    });
      console.log(data);
  });
});
// получаем отредактированные данные и отправляем их в БД
app.post("/goods-edit", function (req, res) {
         
  if(!req.body) return res.sendStatus(400);

    const name = req.body.name;
    const description = req.body.description;
    const cost = req.body.cost;
    const image = req.body.image;
    const category = req.body.category;
    const id = req.body.id;
  con.query("UPDATE goods SET name=?, description=?, cost=?, image=?, category=? WHERE id=?", [name, description, cost, image, category, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/admin-goods");
  });
});

app.post("/category-add/", function (req, res) {
    if(!req.body) return res.sendStatus(400);
    const category1 = req.body.category1;
    const description = null;
    const image = null;
    con.query("INSERT INTO category (category, description, image) VALUES (?,?,?)", [category1, description, image], function(err, data) {
      if(err) return console.log(err);
      res.redirect("/admin-goods");
    });
});

app.post("/admin-goods-delete/:id", function(req, res){
  const id = req.params.id;
  con.query("DELETE FROM goods WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/admin-goods");
  });
});

app.get('/admin-news', function (req, res) {
  con.query("SELECT * FROM news", function(error, result){
      if (error) return reject(error);
      let news = {};
      for (let i = 0; i < result.length; i++){
          news[result[i]['id']] = result[i];
      }
      console.log(news);
  res.render('admin-news', {
      news: JSON.parse(JSON.stringify(news))
  });
  })
});

app.post("/admin-news", function (req, res) {
    if(!req.body) return res.sendStatus(400);
    const title = req.body.title;
    const date = req.body.date;
    const text = req.body.text;
    const image = req.body.image;
    con.query("INSERT INTO news (title, date, image, text) VALUES (?,?,?,?)", [title, date, image, text], function(err, data) {
      if(err) return console.log(err);
      res.redirect("/news");
    });
});

app.post("/admin-news/:id", function(req, res){
  const id = req.params.id;
  con.query("DELETE FROM news WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/news");
  });
});

app.get('/admin-order', function (req, res) {
  con.query(`SELECT 
      shop_order.id as id,
      shop_order.user_id as user_id,
        shop_order.goods_id as goods_id,
        shop_order.goods_cost as goods_cost,
        shop_order.goods_amount as goods_amount,
        shop_order.total as total,
        from_unixtime(date,"%Y-%m-%d %h:%m") as human_date,
        user_info.user_name as user,
        user_info.user_phone as phone,
        user_info.address as address
    FROM 
      shop_order
    LEFT JOIN	
      user_info
    ON shop_order.user_id = user_info.id ORDER BY id DESC`, function (error, result, fields) {
      if (error) throw error;
      console.log(result);
      res.render('admin-order', { order: JSON.parse(JSON.stringify(result)) });
    });
});

/**
 *  login form ==============================
 */
app.get('/login', function (req, res) {
  res.render('login', {});
});

app.post('/login', function (req, res) {
  console.log('=======================');
  console.log(req.body);
  console.log(req.body.login);
  console.log(req.body.password);
  console.log('=======================');
  con.query(
    'SELECT * FROM user WHERE login="' + req.body.login + '" and password="' + req.body.password + '"',
    function (error, result) {
      if (error) reject(error);
      console.log(result);
      console.log(result.length);
      if (result.length == 0) {
        console.log('error user not found');
        res.redirect('/login');
      }
      else {
        result = JSON.parse(JSON.stringify(result));
        let hash = makeHash(32);
        res.cookie('hash', hash);
        res.cookie('id', result[0]['id']);
        /**
         * write hash to db
         */
        sql = "UPDATE user  SET hash='" + hash + "' WHERE id=" + result[0]['id'];
        con.query(sql, function (error, resultQuery) {
          if (error) throw error;
          res.redirect('/admin');
        });
      };
    });
});

function saveOrder(data, result) {
  // data - информация о пользователе
  // result - сведения о товаре
  let sql;
  sql = "INSERT INTO user_info (user_name, user_phone, user_email, address) VALUES ('" + data.username + "','" + data.phone + "','" + data.email + "','" + data.address + "')";
  con.query(sql, function (error, resultQuery) {
    if (error) throw error;
    console.log('1 user info saved');
    console.log(resultQuery);
    let userId = resultQuery.insertId;
    date = new Date() / 1000;
    for (let i = 0; i < result.length; i++) {
      sql = "INSERT INTO shop_order(date, user_id, goods_id,goods_cost, goods_amount, total) VALUES (" + date + "," + userId + "," + result[i]['id'] + "," + result[i]['cost'] + "," + data.key[result[i]['id']] + "," + data.key[result[i]['id']] * result[i]['cost'] + ")";
      con.query(sql, function (error, resultQuery) {
        if (error) throw error;
        console.log("1 goods saved");
      })
    }
  });

}

async function sendMail(data, result) {
  let res = '<h2>Заказ в магазине Tina</h2>';
  let total = 0;
  for (let i = 0; i < result.length; i++) {
    res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - ${result[i]['cost'] * data.key[result[i]['id']]} BLR</p>`;
    total += result[i]['cost'] * data.key[result[i]['id']];
  }
  console.log(res);
  res += '<hr>';
  res += `Итого ${total} BLR`;
  res += `<hr>Телефон: ${data.phone}`;
  res += `<hr>Пользователь: ${data.username}`;
  res += `<hr>Адрес и комментарий: ${data.address}`;
  res += `<hr>Email: ${data.email}`;

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
       user: 'kazukevich.valentina@gmail.com',
       pass: 'max090909kaz'
    }
  });

  let mailOption = {
    from: 'Tina.by',
    to: 'kazukevich.valentina@gmail.com,' + data.email,
    subject: "Tina.by Новый заказ",
    text: res,
    html: res
  };

  let info = await transporter.sendMail(mailOption);
  console.log("MessageSent: %s", info.messageId);
  console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));
  return true;
}

function makeHash(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//=====================upload============================= 
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./public/images");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
  
    if(file.mimetype === "image/png" || 
    file.mimetype === "image/jpg"|| 
    file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
 }

app.use(express.static(__dirname));
app.use(multer({storage:storageConfig, fileFilter: fileFilter}).single("filedata"));
app.post("/upload", function (req, res, next) {
   
    let filedata = req.file;
    console.log(filedata);
    if(!filedata)
        res.send("Ошибка при загрузке файла");
    else
        res.send("Файл загружен");
});