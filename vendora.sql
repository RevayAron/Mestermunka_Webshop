-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 27. 11:54
-- Kiszolgáló verziója: 9.9.0
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `vendora`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(110) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`) VALUES
(1, NULL, 'Gamer Perifériák', 'gamer-periferiak'),
(2, NULL, 'Számítástechnika', 'szamitastechnika'),
(3, NULL, 'Háztartási gépek', 'haztartasi-gepek'),
(4, NULL, 'Szórakoztató elektronika', 'szorakoztato-elektronika'),
(5, NULL, 'Bútorok', 'butorok'),
(6, NULL, 'Okoseszközök', 'okoseszkozok'),
(7, NULL, 'Ruházat', 'ruhazat'),
(8, NULL, 'Kiegészítők', 'kiegeszitok'),
(9, NULL, 'Sport és Szabadidő', 'sport-es-szabadido'),
(10, NULL, 'Irodaszer', 'irodaszer'),
(11, NULL, 'Szépségápolás', 'szepsegapolas');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'Bankkártya',
  `shipping_address` text NOT NULL,
  `order_date` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `payment_method`, `shipping_address`, `order_date`, `is_deleted`) VALUES
(14, 1, 2050.00, 'pending', 'Utánvét', 'Németújvár utca 13 1. emelet 7. ajtó, 20 Szombathely', '2026-04-23 19:03:44', 1),
(15, 15, 2050.00, 'paid', 'Bankkártya', 'Németújvár utca 13 1. emelet 7. ajtó, 20 Alsoujlak', '2026-04-23 20:02:53', 1),
(16, 19, 160230.00, 'shipped', 'Utánvét', 'Németújvár utca 13 1. emelet 7. ajtó, 20 Szombathely', '2026-04-24 18:22:31', 1),
(17, 18, 70.00, 'paid', 'Bankkártya', 'Németújvár utca 13 1. emelet 7. ajtó, 20 Szombathely', '2026-04-24 18:24:15', 1),
(18, 1, 8000.00, 'paid', 'Bankkártya', 'Rendeles utca, 0211 Rendeles', '2026-04-27 11:52:49', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(12,2) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`, `status`) VALUES
(17, 14, 38, 1, 2050.00, 1),
(18, 15, 38, 1, 2050.00, 1),
(19, 16, 41, 2, 80085.00, 2),
(20, 16, 39, 1, 60.00, 2),
(21, 17, 40, 1, 70.00, 1),
(22, 18, 155, 1, 3500.00, 1),
(23, 18, 132, 1, 4500.00, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock_quantity`, `user_id`, `created_at`, `category_id`, `image_url`, `is_approved`, `is_deleted`) VALUES
(42, 'ProGamer Egér', '16000 DPI optikai szenzorral és programozható gombokkal.', 14990.00, 50, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/57/b3/5c/57b35ce4212193be460c9f70634b14b8.jpg', 1, 0),
(43, 'Mechanikus Billentyűzet', 'RGB világítás és kék kapcsolók a pontos gépelésért.', 24990.00, 30, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/16/37/cf/1637cf772857f871a365efffe3510eb4.jpg', 1, 0),
(44, '7.1 Gamer Fejhallgató', 'Térhatású hangzás és zajszűrős mikrofon.', 18500.00, 45, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/55/ff/44/55ff44650711ea60c9e7c17f9927cc3a.jpg', 1, 0),
(45, 'XXL Egérpad', '90x40 cm-es méret, csúszásgátló gumi alappal.', 4500.00, 100, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/736x/04/b1/1d/04b11d0b46badf40c4f48d3ef45a601e.jpg', 1, 0),
(46, 'Ergonomikus Gamer Szék', 'Kényelmes kialakítás, derék- és nyakpárnával.', 55000.00, 15, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/736x/06/bd/f1/06bdf144f0b280f84dad8d117906449d.jpg', 1, 0),
(47, '27\" 144Hz Monitor', 'Gördülékeny játékélmény, 1ms válaszidő.', 89000.00, 12, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/94/70/d5/9470d5eed455e005e77c8cec1b74f23e.jpg', 1, 0),
(48, 'Konzol Kontroller', 'Vezeték nélküli irányító PC-hez és konzolhoz.', 19900.00, 40, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/e1/0f/c3/e10fc3b40a282173d7504b0d3c6c990c.jpg', 1, 0),
(49, 'Kondenzátor Mikrofon', 'Stúdió minőségű hangrögzítés streameléshez.', 22000.00, 25, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/f6/82/fe/f682fe22dfa49b003b868120184a2f9d.jpg', 1, 0),
(50, '1080p Webkamera', 'Kristálytiszta képminőség és beépített autofókusz.', 15000.00, 35, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/736x/46/82/ed/4682edf4afa82b6eed7e9551ebb9f5e1.jpg', 1, 0),
(51, 'Gamer Router', 'Alacsony ping és megbízható Wi-Fi 6 kapcsolat.', 45000.00, 10, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/736x/9f/10/c5/9f10c585d47603fb17e6281b1bf4b14b.jpg', 1, 0),
(52, 'Laptop Hűtőpad', 'Dupla ventilátoros hűtés, állítható dőlésszög.', 8900.00, 60, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/736x/75/9b/26/759b263dd08f5facce26a7a294bd5aba.jpg', 1, 0),
(53, 'VR Szemüveg', 'Teljesen immerzív virtuális valóság élmény.', 125000.00, 5, 1, '2026-04-26 20:06:36', 1, 'https://i.pinimg.com/1200x/32/d4/24/32d4245461cd6b0df6b80f53f71e041f.jpg', 1, 0),
(54, 'Okos Robotporszívó', 'Lézeres navigáció és felmosó funkció.', 95000.00, 20, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/736x/a9/98/51/a99851d4a04a8ab6633b0b12322cbc66.jpg', 1, 0),
(55, 'Kapszulás Kávéfőző', 'Kompakt dizájn, gyors felfűtés és finom kávé.', 25000.00, 40, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/736x/c5/ea/16/c5ea161f00302b2b3d203aee2cbf676c.jpg', 1, 0),
(56, 'Mikrohullámú Sütő', '800W teljesítmény, kiolvasztó funkcióval.', 32000.00, 30, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/1200x/e5/c4/9e/e5c49e41c59fd213a58302eb43ce5e68.jpg', 1, 0),
(57, 'Digitális Vízforraló', 'Hőfokszabályozás és melegen tartó funkció.', 12500.00, 60, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/1200x/77/32/ba/7732ba03cbeb0f4e184945082e055c90.jpg', 1, 0),
(58, 'Turmixgép', 'Üvegkancsós kivitel, jégzúzás funkcióval.', 18000.00, 35, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/736x/fb/26/87/fb26871b72edb97f2c7da19c1f8124c3.jpg', 1, 0),
(59, 'Gőzölős Vasaló', 'Kerámia talp és erős gőzlövet a gyűrődések ellen.', 14000.00, 50, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/736x/3e/32/b6/3e32b6bea73eef7dcb89b2dcf9d15558.jpg', 1, 0),
(60, 'Ionizáló Hajszárító', 'Professzionális AC motor és hideglevegő gomb.', 16500.00, 45, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/1200x/e9/1b/ab/e91baba09950b5006509aac3e1b9e769.jpg', 1, 0),
(61, 'Indukciós Főzőlap', 'Hordozható, egyzónás főzőlap időzítővel.', 21000.00, 25, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/736x/5e/4f/90/5e4f90f2f264df6592283b0ba8304e75.jpg', 1, 0),
(62, 'Kenyérpirító', 'Kétszeletes kialakítás, morzsatálcával.', 8500.00, 70, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/1200x/24/04/2d/24042ddfca2bd2b7e8bcb12399164c9f.jpg', 1, 0),
(63, 'Légtisztító Berendezés', 'HEPA szűrővel a pollenek és a por ellen.', 45000.00, 15, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/1200x/08/f0/e4/08f0e4c34d6ad168f3c323a3b7f4583f.jpg', 1, 0),
(64, 'Párásító Készülék', 'Ultrahangos technológia, csendes működés.', 14500.00, 40, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/1200x/b4/aa/54/b4aa54fcaa496357565ba89b899380d0.jpg', 1, 0),
(65, 'Konyhai Mérleg', 'Precíz digitális mérleg LCD kijelzővel.', 4500.00, 100, 1, '2026-04-26 20:06:36', 2, 'https://i.pinimg.com/736x/b2/fe/5c/b2fe5c3143d2f22da36bac49f6667bbd.jpg', 1, 0),
(66, '55\" 4K Smart TV', 'UHD felbontás és beépített streaming appok.', 135000.00, 15, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/9f/37/5b/9f375b72494224eb5c43b3589fcab6d4.jpg', 1, 0),
(67, 'Bluetooth Hangszóró', 'Vízálló kialakítás és 12 órás üzemidő.', 16000.00, 80, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/736x/54/d2/3e/54d23e3c1ddcd6a6a842ac2398ef8a15.jpg', 1, 0),
(68, 'Zajszűrős Fülhallgató', 'TWS fülhallgató aktív zajszűréssel (ANC).', 28000.00, 50, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/99/9b/68/999b687e9941ece361069834ece42f5e.jpg', 1, 0),
(69, 'Okosóra Pulzusmérővel', 'Sportmódok, alvásfigyelés és értesítések.', 35000.00, 40, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/736x/00/bd/64/00bd64850231c5800c17aebb41f6e79d.jpg', 1, 0),
(70, '20000mAh Powerbank', 'Gyorstöltés támogatás, több USB port.', 12500.00, 100, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/20/69/0d/20690dd093157ed7a3786add6903ade5.jpg', 1, 0),
(71, 'E-book Olvasó', 'Tükröződésmentes kijelző és háttérvilágítás.', 45000.00, 25, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/ce/fa/9a/cefa9a8883a4403c66f8c43f341324de.jpg', 1, 0),
(72, 'Akciókamera', '4K videórögzítés, vízálló tokkal.', 32000.00, 30, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/3b/f5/d5/3bf5d5c7dc00f8cf9c98f4aebda21b43.jpg', 1, 0),
(73, 'Hordozható SSD (1TB)', 'Villámgyors adatátvitel és kompakt méret.', 38000.00, 45, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/37/be/11/37be11bd3733bee5b8ed73fbc0290380.jpg', 1, 0),
(74, 'Drón HD Kamerával', 'Kezdőbarát drón magasságtartó funkcióval.', 42000.00, 10, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/44/10/cb/4410cb5a68871da4b8f0b6e50a5f4375.jpg', 1, 0),
(75, 'Okos Konnektor', 'Okostelefonról vezérelhető és fogyasztásmérő.', 6500.00, 90, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/6d/c3/44/6dc344777b02895e2d21766b3b3addea.jpg', 1, 0),
(76, 'Projektor', 'Házimozi élmény akár 120\" képátlóval.', 75000.00, 8, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/1200x/34/fc/d4/34fcd497b0278ce3c32feaf1f1e4d2c9.jpg', 1, 0),
(77, 'Soundbar', 'Tiszta tévéhangzás beépített mélynyomóval.', 48000.00, 20, 1, '2026-04-26 20:06:36', 3, 'https://i.pinimg.com/736x/97/cc/a5/97cca51bfcd79b47f176d26138f434b5.jpg', 1, 0),
(78, 'Háromszemélyes Kanapé', 'Kényelmes szövet borítás, letisztult dizájn.', 115000.00, 8, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/e9/a5/4c/e9a54c68b2c8a3d681689839d675bc0c.jpg', 1, 0),
(79, 'Dohányzóasztal', 'Tömörfa asztallap és fém lábak.', 35000.00, 20, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/85/1a/ed/851aedd7dfb158673eecedd32fbd54c2.jpg', 1, 0),
(80, 'Könyvespolc', '5 polcos kialakítás, stabil szerkezet.', 22000.00, 35, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/61/aa/6c/61aa6cd6be222cdf593930b1265e8ea1.jpg', 1, 0),
(81, 'Étkezőszék', 'Kárpitozott ülőfelület a kényelmes étkezéshez.', 16000.00, 60, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/1200x/8e/ed/a2/8eeda2b9011380296559998dfc25da59.jpg', 1, 0),
(82, 'Franciaágy Keret', '160x200 cm, ágyneműtartó nélkül.', 65000.00, 12, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/1200x/34/71/f3/3471f30800e38b026feb8fad28638b9d.jpg', 1, 0),
(83, 'Éjjeliszekrény', 'Egyfiókos kivitel, nyitott alsó polccal.', 14500.00, 40, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/64/06/97/640697d70ad3abe76c9a6ebab6b7d68c.jpg', 1, 0),
(84, 'Ruhásszekrény', 'Kétajtós, akasztós és polcos elrendezéssel.', 85000.00, 10, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/7b/c1/36/7bc13657ffca6a44bb4119328ad408e1.jpg', 1, 0),
(85, 'Íróasztal', 'Tágas munkafelület, modern stílusban.', 38000.00, 25, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/a5/4b/aa/a54baa33dff062285838b368299c19c4.jpg', 1, 0),
(86, 'Komód', 'Három tágas fiókkal a ruhák tárolásához.', 32000.00, 30, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/23/7b/fc/237bfc94643aa095afc8c2f1851f6d59.jpg', 1, 0),
(87, 'TV Állvány', 'Kábelelvezető nyílással és tárolórekeszekkel.', 28000.00, 22, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/736x/f6/b6/92/f6b69274ef074c6cbae44612f9a29d84.jpg', 1, 0),
(88, 'Olvasófotel', 'Ergonomikus háttámla és puha karfák.', 45000.00, 15, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/1200x/84/08/05/840805dbebced859ab4b2b7ac9bf5fe5.jpg', 1, 0),
(89, 'Cipősszekrény', 'Billenőajtós kialakítás, helytakarékos.', 21000.00, 35, 1, '2026-04-26 20:06:36', 4, 'https://i.pinimg.com/1200x/11/9a/fe/119afecefdf288508fda0c56b1bde1a6.jpg', 1, 0),
(90, 'Férfi Bőröv', 'Valódi bőr, elegáns fém csattal.', 8500.00, 80, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/f4/9a/63/f49a6394b855fd2b618b1c82c8df5199.jpg', 1, 0),
(91, 'Napszemüveg', 'UV400 védelem, klasszikus pilóta stílus.', 6500.00, 120, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/736x/99/9f/22/999f22d53f582656bf5d7f74fa14620f.jpg', 1, 0),
(92, 'Kötött Sál', 'Puha és meleg anyag, téli napokra.', 4500.00, 150, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/fe/76/71/fe7671383830ddb977136dfeb5ce27dc.jpg', 1, 0),
(93, 'Bőr Kesztyű', 'Finom bélés, érintőképernyő kompatibilis.', 9900.00, 60, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/b1/fe/13/b1fe133ef4cef9e9fb7375253732c232.jpg', 1, 0),
(94, 'Elegáns Nyakkendő', 'Selyemhatású anyag, klasszikus mintával.', 5500.00, 90, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/8a/d3/16/8ad316076985a77c1c9d7935cab2e8f8.jpg', 1, 0),
(95, 'Női Sapka', 'Bojtos téli sapka, meleg gyapjúkeverékből.', 4900.00, 100, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/5d/93/fc/5d93fcff1a7cdb71a32ba421f2eea527.jpg', 1, 0),
(96, 'Divatos Karóra', 'Kvarc szerkezet és rozsdamentes acél szíj.', 24000.00, 35, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/736x/db/0d/63/db0d63f6931761e4a58206e2358aee85.jpg', 1, 0),
(97, 'Ezüst Nyaklánc', 'Finom láncszemek, minimalista medállal.', 12500.00, 45, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/9b/43/ac/9b43ace6a070d35c137f860269cc8ea8.jpg', 1, 0),
(98, 'Esernyő', 'Szélálló szerkezet, automata nyitás.', 5500.00, 85, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/736x/9f/7f/6c/9f7f6cabd51fe3485f03915d76cbc852.jpg', 1, 0),
(99, 'Kulcstartó', 'Valódi bőr, strapabíró karikával.', 2500.00, 200, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/736x/91/25/d2/9125d225000a1c03127b74b5a4d4159a.jpg', 1, 0),
(100, 'Hajpánt Szett', 'Három különböző színű, rugalmas hajpánt.', 1500.00, 150, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/736x/1c/d0/c9/1cd0c92522bf547445b5a72e5e5dee2b.jpg', 1, 0),
(101, 'Csokornyakkendő', 'Előre megkötött, állítható pánttal.', 4000.00, 60, 1, '2026-04-26 20:06:36', 5, 'https://i.pinimg.com/1200x/c0/d2/85/c0d285dc32d4bc4b134e2114a6cd935f.jpg', 1, 0),
(102, 'Pamut Póló', '100% organikus pamut, kényelmes viselet.', 4500.00, 150, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/20/e0/c3/20e0c39f3a285dea34d7adf9a8306942.jpg', 1, 0),
(103, 'Férfi Farmernadrág', 'Klasszikus egyenes szabás, tartós anyag.', 14000.00, 80, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/9e/9f/04/9e9f04698ac445197241a54b92872833.jpg', 1, 0),
(104, 'Kapucnis Pulóver', 'Puha bélés, kenguruzsebbel.', 9500.00, 100, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/736x/f7/67/9c/f7679c84bd40669b7b66c021244205cd.jpg', 1, 0),
(105, 'Téli Kabát', 'Vízlepergető réteg és meleg tömőanyag.', 28000.00, 40, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/26/45/69/264569bd05c041bda382bd5719276d3c.jpg', 1, 0),
(106, 'Futócipő', 'Kiváló ütéscsillapítás és légáteresztő felsőrész.', 22000.00, 65, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/c7/8f/13/c78f1389e2252bfa392582b64643f1f2.jpg', 1, 0),
(107, 'Női Nyári Ruha', 'Könnyű anyag, virágmintás dizájn.', 11500.00, 55, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/736x/3a/3a/f8/3a3af8283f19e25754c886eaca1f2bf9.jpg', 1, 0),
(108, 'Sport Leggings', 'Magas derekú kialakítás az edzésekhez.', 7500.00, 90, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/d0/f4/1a/d0f41a59fc1a9f25cdaf084a92995058.jpg', 1, 0),
(109, 'Elegáns Ing', 'Karcsúsított szabás, könnyen vasalható.', 8900.00, 70, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/736x/fd/b0/23/fdb0239180163b4ff55bb9db5b713d4a.jpg', 1, 0),
(110, 'Túrabakancs', 'Vízálló membrán és bordázott talp.', 35000.00, 30, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/736x/0c/15/cd/0c15cdd39d106d41e186db5c472b9ab3.jpg', 1, 0),
(111, 'Rövidnadrág', 'Kényelmes pamut anyag, nyári napokra.', 5500.00, 110, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/a2/8c/fd/a28cfd77322a392f3b67b6af03eea6fb.jpg', 1, 0),
(112, 'Strandpapucs', 'Könnyű és csúszásmentes talp.', 3500.00, 120, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/b5/5a/d0/b55ad022bacebcc3f112e5689c12d339.jpg', 1, 0),
(113, 'Vászonszoknya', 'Térdig érő hossz, zsebekkel.', 8000.00, 45, 1, '2026-04-26 20:06:36', 6, 'https://i.pinimg.com/1200x/ba/77/9d/ba779d1ddc35dbf8e65c8b654b27186d.jpg', 1, 0),
(114, 'Városi Hátizsák', 'Vízlepergető anyag és laptoptartó rekesz.', 14500.00, 75, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/1200x/da/4e/fb/da4efb97e7655cd29d2091e4a789b208.jpg', 1, 0),
(115, 'Női Kézitáska', 'Elegáns műbőr táska aranyozott részletekkel.', 18000.00, 40, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/6f/74/36/6f74366981e223a804c3bd893a599536.jpg', 1, 0),
(116, 'Férfi Pénztárca', 'Klasszikus bifold kialakítás aprópénztartóval.', 8500.00, 100, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/1200x/55/c4/09/55c4095442731e334b8aab3b3d82e1e2.jpg', 1, 0),
(117, 'Gurulós Bőrönd', 'Keményfedeles, 4 kerekes kabinbőrönd.', 25000.00, 30, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/1200x/ed/6c/72/ed6c72de3638af8be3831f8aae3d8289.jpg', 1, 0),
(118, 'Sporttáska', 'Külön rekesz a cipőnek, tágas belső tér.', 11000.00, 60, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/b8/94/0a/b8940ad79f52f68604b9722af2049994.jpg', 1, 0),
(119, 'Laptoptáska 15.6\"', 'Párnázott belső az eszköz maximális védelméért.', 9500.00, 85, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/1c/23/42/1c234208853e704e4586742ccf8fd34a.jpg', 1, 0),
(120, 'Övtáska', 'Praktikus viselet fesztiválokra és kiránduláshoz.', 4500.00, 120, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/14/f6/16/14f61697f14c0bb82438b1075b8dc91f.jpg', 1, 0),
(121, 'Női Pénztárca', 'Hosszított fazon, rengeteg kártyatartóval.', 9900.00, 70, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/1200x/37/7e/a2/377ea2b8dd5018848e1568f4ae45f54f.jpg', 1, 0),
(122, 'Kártyatartó', 'RFID védelemmel a digitális lopás ellen.', 5500.00, 150, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/a5/5a/3d/a55a3dc47a44f2d9deb1ae46f79aa760.jpg', 1, 0),
(123, 'Vászontáska', 'Környezetbarát bevásárlótáska egyedi mintával.', 2500.00, 200, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/c3/66/7f/c3667f54001b21b286c8abdc72061593.jpg', 1, 0),
(124, 'Aktatáska', 'Klasszikus üzleti táska valódi bőrből.', 35000.00, 15, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/97/58/de/9758de75176f031506e3f7d26b9fb045.jpg', 1, 0),
(125, 'Sminktáska', 'Kompakt neszesszer az utazásokhoz.', 4500.00, 90, 1, '2026-04-26 20:06:36', 7, 'https://i.pinimg.com/736x/db/5c/65/db5c65c8a20c6e75bc4478858d0ba8a0.jpg', 1, 0),
(126, 'Jógamatrac', 'Csúszásmentes felület és hordozópánt.', 6500.00, 80, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/736x/85/bb/2f/85bb2f678839fb27a6a321c47d599da2.jpg', 1, 0),
(127, 'Állítható Súlyzó', '10 kg-os szett, variálható tárcsákkal.', 15000.00, 45, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/c9/4a/cc/c94acc55f0a16620f13d5f5d7f20f598.jpg', 1, 0),
(128, 'Ugrókötél', 'Csapágyas fogantyúk és állítható acélsodrony.', 3500.00, 150, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/30/ee/b3/30eeb33e4f9ca7c1e6038b445d56ae40.jpg', 1, 0),
(129, 'Focilabda', 'Hivatalos 5-ös méret, varrott panelek.', 8500.00, 60, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/d9/21/2b/d9212b2cc98e88c1817649495107d777.jpg', 1, 0),
(130, 'Kemping Sátor', '2 személyes, gyorsan felállítható pop-up sátor.', 22000.00, 25, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/736x/59/0f/0c/590f0c4ae2e18a6c507508d42ba7a2f0.jpg', 1, 0),
(131, 'Túrabot', 'Teleszkópos, rezgéscsillapító rendszerrel.', 9500.00, 50, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/736x/40/89/c9/4089c9b5c7c90e016820cf408e8d293b.jpg', 1, 0),
(132, 'Úszószemüveg', 'Páramentesítő bevonat és UV védelem.', 4500.00, 100, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/e9/ce/e2/e9cee21d2ae7ce5d1423b924cfca4574.jpg', 1, 0),
(133, 'Kerékpár Sisak', 'Pehelykönnyű és kiválóan szellőző kialakítás.', 12500.00, 40, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/5a/84/24/5a84249e2bc6c1eab7efca2dcc8d9d55.jpg', 1, 0),
(134, 'Rollerek', 'Összecsukható alumínium váz, városi közlekedéshez.', 28000.00, 20, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/22/cf/f3/22cff33b7466d31e81b16c9acd781a90.jpg', 1, 0),
(135, 'Fitnesz Szalag Szett', '5 különböző ellenállási fokozat.', 3900.00, 120, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/1200x/c6/07/a7/c607a78a3170ac99a2113b85929cd77f.jpg', 1, 0),
(136, 'Kempingfőző', 'Kompakt gázfőző túrázáshoz.', 7500.00, 35, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/736x/b5/fb/53/b5fb534e63f3b9828f098b91a89c5739.jpg', 1, 0),
(137, 'Kosárlabda', 'Kültéri és beltéri használatra egyaránt.', 9500.00, 45, 1, '2026-04-26 20:06:36', 8, 'https://i.pinimg.com/736x/7c/14/a2/7c14a2a05749f1228d51e1ba463d2247.jpg', 1, 0),
(138, 'Mágneses Fehér Tábla', '90x120 cm-es tábla alumínium kerettel.', 12500.00, 30, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/a3/74/6f/a3746f0223c7766454e1277f9a07212f.jpg', 1, 0),
(139, 'Prémium Golyóstoll', 'Fém test, kék tinta, díszdobozban.', 4500.00, 100, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/29/c2/16/29c2168814bd3147b6b808505380a7dc.jpg', 1, 0),
(140, 'Asztali Rendező', 'Fából készült tároló tollak és névjegykártyák számára.', 6500.00, 50, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/1200x/c1/4f/08/c14f083a4340d0f883740c709df532bc.jpg', 1, 0),
(141, 'Ergonomikus Egérpad', 'Zselés csuklótámasszal a fáradtság megelőzésére.', 3500.00, 120, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/1200x/43/e9/9b/43e99b3425d5250d8943003012704747.jpg', 1, 0),
(142, 'A4 Jegyzetfüzet', 'Vonalas, keményfedeles füzet könyvjelzővel.', 2500.00, 150, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/1200x/d6/5b/f5/d65bf5c55f540179264671bcbbc3e954.jpg', 1, 0),
(143, 'Tűzőgép', 'Kapacitás: 50 lap, fém szerkezet.', 3200.00, 80, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/35/0a/8c/350a8ca63635848fdfbe28407d1193f4.jpg', 1, 0),
(144, 'Iratmegsemmisítő', 'Konfettivágás, 15 literes tartállyal.', 18000.00, 20, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/37/fe/e5/37fee58177b70bca23313ac06ee22f38.jpg', 1, 0),
(145, 'Szövegkiemelő Szett', '4 élénk szín, ferde heggyel.', 1500.00, 200, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/82/eb/99/82eb99f4c6a541e227353d1c197f6e25.jpg', 1, 0),
(146, 'Asztali Lámpa', 'Állítható színhőmérséklet és fényerő, LED technológia.', 11500.00, 45, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/1200x/a4/06/db/a406dbba05bc1199eebe6eb1fa89f95c.jpg', 1, 0),
(147, 'Lyukasztó', 'Kétlyukú, fém lyukasztó távtartóval.', 2800.00, 90, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/2a/7f/76/2a7f761e506e835f09951ffddb8924ba.jpg', 1, 0),
(148, 'Mappatartó Papucs', 'Erős műanyag, A4-es mérethez.', 1200.00, 250, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/736x/e6/85/c5/e685c511fc4d0454095f33ae9c756d40.jpg', 1, 0),
(149, 'Tudományos Számológép', '240 funkció, kétsoros kijelző.', 5500.00, 60, 1, '2026-04-26 20:06:36', 9, 'https://i.pinimg.com/1200x/61/ca/e7/61cae79087ca77bbe785463d59f46cab.jpg', 1, 0),
(150, 'Hidratáló Arckrém', 'Hialuronsavval és E-vitaminnal dúsítva.', 5500.00, 90, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/736x/ce/0b/d7/ce0bd7ac6738d2919c1f95a757e41af1.jpg', 1, 0),
(151, 'Női Parfüm', 'Virágos-gyümölcsös illat, 50 ml.', 18000.00, 40, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/736x/c8/76/88/c87688535521c9bbb6435e7157dce1c5.jpg', 1, 0),
(152, 'Férfi Tusfürdő', 'Frissítő mentolos illat, 3in1 formula.', 1800.00, 150, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/a8/40/a9/a840a9103137e19f8a8cd7f935801d93.jpg', 1, 0),
(153, 'Micellás Víz', 'Kíméletes sminkeltávolító érzékeny bőrre.', 2500.00, 110, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/736x/b1/90/24/b190248e4176a12662a09197865ac472.jpg', 1, 0),
(154, 'Hajápoló Olaj', 'Argánolajos kivonat a fényes és puha hajért.', 4500.00, 75, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/736x/d4/c5/06/d4c5064fb26e6e88d527f714957c645b.jpg', 1, 0),
(155, 'Matt Rúzs', 'Tartós szín, nem szárítja az ajkakat.', 3500.00, 120, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/20/9d/a4/209da416ff0c896315bc1ccea3c196f0.jpg', 1, 0),
(156, 'Szempillaspirál', 'Vízálló formula dúsító kefével.', 4200.00, 95, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/736x/0e/07/19/0e0719573f159d2920e9057f8e3f6f76.jpg', 1, 0),
(157, 'Testápoló Lotion', 'Mandulaolajjal a száraz bőr ellen.', 3200.00, 100, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/6e/f1/87/6ef18769183eaee5a611e479d788c3d3.jpg', 1, 0),
(158, 'Borotvahab', 'Aloe verával az irritáció mentes borotválkozásért.', 1900.00, 130, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/b6/d7/71/b6d771f2411a79f94aa85ed6b9213cf7.jpg', 1, 0),
(159, 'Folyékony Alapozó', 'Közepes fedés, természetes hatás.', 5500.00, 60, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/e9/aa/70/e9aa703c50a67fbd16b2af1630a757b5.jpg', 1, 0),
(160, 'Kézkrém', 'Gyorsan beszívódó formula sheavajjal.', 1500.00, 200, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/26/cb/a2/26cba251b0fc6a87fd2cfa3e2b62cceb.jpg', 1, 0),
(161, 'Férfi Parfüm', 'Fás-fűszeres illat, 100 ml.', 16000.00, 45, 1, '2026-04-26 20:06:36', 10, 'https://i.pinimg.com/1200x/f4/b3/10/f4b310938c9391058623879c5834188b.jpg', 1, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(1) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` int(11) NOT NULL DEFAULT 2,
  `status` int(11) NOT NULL DEFAULT 1,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `tax_number` varchar(50) DEFAULT NULL,
  `bank_account` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `status`, `first_name`, `last_name`, `phone`, `company_name`, `tax_number`, `bank_account`, `created_at`, `updated_at`, `is_deleted`, `image_url`) VALUES
(1, 'vegre@mukodik.hu', '$2a$11$5cNztBMBfTyoEHw7aSjcB.5Gm2fIdjnrVe3/6gDEUc6GaOSazzagy', 0, 1, 'Vendora', 'Admin', NULL, '', NULL, NULL, '2026-04-08 10:34:01', '2026-04-23 16:34:01', 0, 'https://localhost:7211/user_avatars/avatar_1_7d497ec2-f3e7-470a-9e66-6fd4c442bfe8.jpg'),
(12, 'vendor@vendora.hu', '$2a$11$PSZLTH6hP746vwSW/CSLrOMWxmYyV5ojgdXkci2DE5tx9Qi4Rdx/W', 1, 2, 'Céges', 'Fiók', NULL, 'Vendor', 'HU12345678', NULL, '2026-04-22 17:37:37', '2026-04-22 17:37:37', 1, NULL),
(13, 'customer@vendora.hu', '$2a$11$vZk61nmGG.UC4nioWdhHX.0pWKGcybLk11AwCbAvjS4mEe5IdHfe2', 2, 2, 'Customer', 'Fiók', NULL, '', NULL, NULL, '2026-04-22 17:43:18', '2026-04-23 15:00:09', 1, NULL),
(15, 'v@v.hu', '$2a$11$rqVTRPlm4rz.8U9dnlmCC..XngeuTCDaGah7oBd/5tsZyKQphKYZ.', 1, 2, 'Céges', 'Fiók', NULL, '', 'HU1234567', NULL, '2026-04-23 16:38:52', '2026-04-24 13:47:19', 1, 'https://localhost:7211/user_avatars/avatar_15_ca20dd78-4fb9-471a-99b1-50cc1beaaf5a.jfif'),
(17, 'c@v.hu', '$2a$11$y4nP98ClyLxUWhVUqJ0pweSvFJiyp8jjxaznnmwFNGXg1rqey4foG', 2, 2, 'Customer', 'Fiók', NULL, '', NULL, NULL, '2026-04-24 14:04:40', '2026-04-24 14:40:15', 1, 'https://localhost:7211/user_avatars/avatar_17_a6d3592b-45ad-4f31-9750-bdb7f61ff5a0.jpg'),
(18, 'doma@vendora.hu', '$2a$11$Oj0XDcXnvgsJGcbo.eMqpuR5l992M//wdbS8VfzhV1vtchCJoNDFi', 1, 2, 'Céges', 'Fiók', NULL, 'Doma', 'HU12345678', NULL, '2026-04-24 16:16:08', '2026-04-24 16:26:30', 1, 'https://localhost:7211/user_avatars/avatar_18_e29176df-6d7a-4bf3-9fac-9c5b58141564.jfif'),
(19, 'ds@vendora.hu', '$2a$11$bBg.3hXGTox1EFiiayzp8OEfpJYaarDFESX1KBrdovy6mqJdU5tzu', 2, 2, 'Doma', 'Customer', NULL, NULL, NULL, NULL, '2026-04-24 16:21:05', '2026-04-24 16:21:05', 1, NULL);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cart_user` (`customer_id`),
  ADD KEY `fk_cart_product` (`product_id`);

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category_parent` (`parent_id`);

--
-- A tábla indexei `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_customer` (`user_id`);

--
-- A tábla indexei `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_item_order` (`order_id`),
  ADD KEY `fk_item_product` (`product_id`);

--
-- A tábla indexei `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_Products_Users` (`user_id`);

--
-- A tábla indexei `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rev_product` (`product_id`),
  ADD KEY `fk_rev_user` (`user_id`);

--
-- A tábla indexei `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT a táblához `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT a táblához `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Megkötések a táblához `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_customer` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Megkötések a táblához `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FK_Products_Users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_rev_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rev_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
