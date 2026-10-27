CREATE TABLE `listing_reservations` (
	`listing_id` text PRIMARY KEY NOT NULL,
	`exchange_id` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exchange_id`) REFERENCES `exchanges`(`id`) ON UPDATE no action ON DELETE no action
);
