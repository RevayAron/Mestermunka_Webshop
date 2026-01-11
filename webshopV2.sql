-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 11, 2026 at 08:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `address_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `street` varchar(150) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`address_id`, `user_id`, `street`, `city`, `postal_code`) VALUES
(1, 1, 'Fő utca 12.', 'Budapest', '1011'),
(2, 1, 'Kert köz 5.', 'Budapest', '1222'),
(3, 2, 'Petőfi Sándor utca 3.', 'Debrecen', '4024'),
(4, 3, 'Kossuth Lajos tér 7.', 'Szeged', '6720'),
(5, 4, 'Rózsa utca 15.', 'Pécs', '7621'),
(6, 5, 'Duna sor 2.', 'Győr', '9022');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  `order_date` datetime NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(30) NOT NULL,
  `shipping_method` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `address_id`, `order_date`, `total_amount`, `status`, `shipping_method`, `address`) VALUES
(1, 1, 1, '2025-10-01 10:15:00', 11980.00, 'completed', 'futár', 'Kapucsengő: 12'),
(2, 1, 2, '2025-10-02 18:30:00', 104980.00, 'completed', 'csomagautomata', 'Automata: BudaPlaza'),
(3, 2, 3, '2025-10-05 14:05:00', 64980.00, 'processing', 'futár', NULL),
(4, 3, 4, '2025-10-06 09:20:00', 89990.00, 'paid', 'futár', NULL),
(5, 4, 5, '2025-10-07 16:45:00', 33970.00, 'completed', 'személyes átvétel', 'Bolt: Pécs, Rózsa u. 1.');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_date` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `order_id`, `user_id`, `payment_date`, `total`) VALUES
(1, 1, 1, '2025-10-01 10:17:00', 11980.00),
(2, 2, 1, '2025-10-02 18:31:00', 104980.00),
(3, 3, 2, '2025-10-05 14:06:00', 64980.00),
(4, 4, 3, '2025-10-06 09:22:00', 89990.00),
(5, 5, 4, '2025-10-07 16:47:00', 33970.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `category_id`, `description`, `price`, `stock`) VALUES
(1, 'Gaming egér', 'peripheral', 'RGB-s gamer egér 16000 DPI-vel', 9990.00, 120),
(2, 'Mechanikus billentyűzet', 'peripheral', 'Kék kapcsolós, háttérvilágítással', 24990.00, 80),
(3, '27\" IPS monitor', 'monitor', '144Hz, 1ms válaszidő', 89990.00, 35),
(4, 'SSD 1TB', 'storage', 'NVMe M.2 SSD, 1 TB kapacitás', 39990.00, 60),
(5, 'Ryzen 5 processzor', 'cpu', '6 mag, 12 szál, AM4 foglalat', 69990.00, 40),
(6, 'ATX ház', 'case', 'Üveg oldallap, jó szellőzés', 29990.00, 50),
(7, '650W tápegység', 'psu', '80+ Gold minősítés', 34990.00, 45),
(8, 'USB-C kábel', 'cable', '1m hosszú, gyors töltés', 1990.00, 200);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `phone`, `password`) VALUES
(1, 'Kiss Áron', 'aron.kiss@example.com', '+36 30 111 1111', 'jelszo123'),
(2, 'Nagy Dóra', 'dora.nagy@example.com', '+36 20 222 2222', 'titok456'),
(3, 'Szabó Bence', 'bence.szabo@example.com', '+36 70 333 3333', 'pass789'),
(4, 'Tóth Eszter', 'eszter.toth@example.com', '+36 30 444 4444', 'qwerty'),
(5, 'Farkas Gábor', 'gabor.farkas@example.com', '+36 20 555 5555', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `fk_addresses_user` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_orders_user` (`user_id`),
  ADD KEY `fk_orders_address` (`address_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `fk_payments_user` (`user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
