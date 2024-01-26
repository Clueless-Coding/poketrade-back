CREATE TABLE IF NOT EXISTS "opened_packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"pack_id" uuid NOT NULL,
	"pokemon_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packs_to_pokemons" (
	"pack_id" uuid NOT NULL,
	"pokemon_id" integer NOT NULL,
	CONSTRAINT "packs_to_pokemons_pack_id_pokemon_id_pk" PRIMARY KEY("pack_id","pokemon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"image" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pokemons" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"worth" integer NOT NULL,
	"height" integer NOT NULL,
	"weight" integer NOT NULL,
	"image" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quick_sold_user_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"user_id" uuid NOT NULL,
	"pokemon_id" integer NOT NULL,
	"sold_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades_to_user_items" (
	"trade_id" uuid NOT NULL,
	"user_type" "trades_to_user_items_user_type" NOT NULL,
	"user_item_id" uuid NOT NULL,
	CONSTRAINT "trades_to_user_items_trade_id_user_item_id_pk" PRIMARY KEY("trade_id","user_item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "trades_status" NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"cancelled_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"rejected_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"pokemon_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"hashed_password" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades_to_receiver_items" (
	"trade_id" uuid NOT NULL,
	"receiver_item_id" uuid NOT NULL,
	CONSTRAINT "trades_to_receiver_items_trade_id_receiver_item_id_pk" PRIMARY KEY("trade_id","receiver_item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades_to_sender_items" (
	"trade_id" uuid NOT NULL,
	"sender_item_id" uuid NOT NULL,
	CONSTRAINT "trades_to_sender_items_trade_id_sender_item_id_pk" PRIMARY KEY("trade_id","sender_item_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "packs_to_pokemons_pack_id_index" ON "packs_to_pokemons" ("pack_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "packs_to_pokemons_pokemon_id_index" ON "packs_to_pokemons" ("pokemon_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_user_items_trade_id_index" ON "trades_to_user_items" ("trade_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_user_items_user_type_index" ON "trades_to_user_items" ("user_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_user_items_user_item_id_index" ON "trades_to_user_items" ("user_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_status_index" ON "trades" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_receiver_items_trade_id_index" ON "trades_to_receiver_items" ("trade_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_receiver_items_receiver_item_id_index" ON "trades_to_receiver_items" ("receiver_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_sender_items_trade_id_index" ON "trades_to_sender_items" ("trade_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trades_to_sender_items_sender_item_id_index" ON "trades_to_sender_items" ("sender_item_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opened_packs" ADD CONSTRAINT "opened_packs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opened_packs" ADD CONSTRAINT "opened_packs_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opened_packs" ADD CONSTRAINT "opened_packs_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "packs_to_pokemons" ADD CONSTRAINT "packs_to_pokemons_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "packs_to_pokemons" ADD CONSTRAINT "packs_to_pokemons_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quick_sold_user_items" ADD CONSTRAINT "quick_sold_user_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quick_sold_user_items" ADD CONSTRAINT "quick_sold_user_items_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_to_user_items" ADD CONSTRAINT "trades_to_user_items_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_to_user_items" ADD CONSTRAINT "trades_to_user_items_user_item_id_user_items_id_fk" FOREIGN KEY ("user_item_id") REFERENCES "user_items"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_items" ADD CONSTRAINT "user_items_pokemon_id_pokemons_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_to_receiver_items" ADD CONSTRAINT "trades_to_receiver_items_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_to_receiver_items" ADD CONSTRAINT "trades_to_receiver_items_receiver_item_id_user_items_id_fk" FOREIGN KEY ("receiver_item_id") REFERENCES "user_items"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_to_sender_items" ADD CONSTRAINT "trades_to_sender_items_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_to_sender_items" ADD CONSTRAINT "trades_to_sender_items_sender_item_id_user_items_id_fk" FOREIGN KEY ("sender_item_id") REFERENCES "user_items"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
