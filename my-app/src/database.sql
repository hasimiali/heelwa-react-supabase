-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.addresses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  recipient_name text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  is_default boolean DEFAULT false,
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.brands (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  logo_url text,
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cart_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cart_id bigint,
  variant_id bigint,
  quantity integer DEFAULT 1,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.carts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  parent_id bigint,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.inventory_log (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  variant_id bigint,
  change_type text CHECK (change_type = ANY (ARRAY['sale'::text, 'restock'::text, 'return'::text, 'adjustment'::text])),
  quantity_change integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_log_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_log_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.order_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint,
  variant_id bigint,
  quantity integer NOT NULL,
  unit_price numeric,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  address_id bigint,
  status text DEFAULT 'pending'::text,
  total_amount numeric,
  payment_status text DEFAULT 'unpaid'::text,
  payment_method text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id)
);
CREATE TABLE public.product_images (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id bigint,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_variants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id bigint,
  sku text UNIQUE,
  color text,
  size text,
  price numeric,
  stock_quantity integer DEFAULT 0,
  image_url text,
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  slug text UNIQUE,
  category_id bigint,
  brand_id bigint,
  description text,
  base_price numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text UNIQUE CHECK (char_length(username) >= 3),
  full_name text,
  avatar_url text,
  website text,
  email text,
  phone text,
  street text,
  city text,
  state text,
  zip text,
  country text,
  role text DEFAULT 'user'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  product_id bigint,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.wishlists (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  variant_id bigint,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT wishlists_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);