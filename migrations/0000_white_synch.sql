CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`color` text NOT NULL,
	`x_pos` real DEFAULT 50 NOT NULL,
	`y_pos` real DEFAULT 50 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
