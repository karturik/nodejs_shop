-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Час створення: Чрв 18 2019 р., 07:44
-- Версія сервера: 5.6.38
-- Версія PHP: 7.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База даних: `lite_shop`
--

-- --------------------------------------------------------

--
-- Структура таблиці `shop_order`
--

CREATE TABLE `shop_order` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `goods_cost` double NOT NULL,
  `goods_amount` int(11) NOT NULL,
  `total` double NOT NULL,
  `date` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `shop_order`
--

INSERT INTO `shop_order` (`id`, `user_id`, `goods_id`, `goods_cost`, `goods_amount`, `total`, `date`) VALUES
(4, 45, 2, 6499, 1, 6499, 1560832967);

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `shop_order`
--
ALTER TABLE `shop_order`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `shop_order`
--
ALTER TABLE `shop_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
