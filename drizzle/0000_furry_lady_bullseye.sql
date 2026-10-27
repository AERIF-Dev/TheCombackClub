CREATE TABLE `ai_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`provider` text NOT NULL,
	`request_type` text NOT NULL,
	`success` integer NOT NULL,
	`latency` integer NOT NULL,
	`error` text,
	`demo` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`exchange_id` text NOT NULL,
	`member_id` text NOT NULL,
	`approved` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`exchange_id`) REFERENCES `exchanges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_approval` ON `exchange_approvals` (`exchange_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`member_id` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchanges` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`match_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`timeline` text NOT NULL,
	`status` text NOT NULL,
	`hours` real NOT NULL,
	`ai` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_proposal_per_match` ON `exchanges` (`match_id`);--> statement-breakpoint
CREATE TABLE `impact_events` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`type` text NOT NULL,
	`reference_id` text NOT NULL,
	`value` real NOT NULL,
	`demo` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`scope` text NOT NULL,
	`kind` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`tags` text NOT NULL,
	`hours` real NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_edges` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`offer_id` text NOT NULL,
	`need_id` text NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`offer_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`need_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`type` text NOT NULL,
	`score` real NOT NULL,
	`explanation` text NOT NULL,
	`data` text NOT NULL,
	`demo` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`auth_id` text,
	`name` text NOT NULL,
	`neighborhood` text NOT NULL,
	`bio` text NOT NULL,
	`availability` text NOT NULL,
	`mode` text NOT NULL,
	`demo` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_identity` ON `members` (`auth_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL
);
