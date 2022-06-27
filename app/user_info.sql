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
-- Структура таблиці `user_info`
--

CREATE TABLE `user_info` (
  `id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `user_phone` varchar(100) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `address` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `user_info`
--

INSERT INTO `user_info` (`id`, `user_name`, `user_phone`, `user_email`, `address`) VALUES
(1, 'ssfsdfs', '+380506542113', 'luschenko@gmail.com', 'sfsdfsd');

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `user_info`
--
ALTER TABLE `user_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
