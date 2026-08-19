DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, v.url, 0
FROM (VALUES
 ('anker-737-power-bank','/images/p-powerbank.jpg'),
 ('baseus-gan5-pro-65w','/images/p-charger.jpg'),
 ('gopro-hero-adventure-mount-kit','/images/p-actioncam.jpg'),
 ('jbl-tune-beam-2','/images/p-earbuds.jpg'),
 ('sandisk-extreme-pro-microsd-256gb','/images/p-memorycard.jpg'),
 ('rockbros-bike-mobile-holder-pro','/images/p-bikemount.jpg'),
 ('ugreen-revodok-8-in-1-hub','/images/p-hub.jpg'),
 ('insta360-invisible-selfie-stick','/images/p-tripod.jpg'),
 ('joyroom-100w-braided-usb-c-cable','/images/p-cable.jpg'),
 ('samsung-galaxy-rugged-case','/images/p-case.jpg'),
 ('travel-gadget-organizer-case','/images/p-bag.jpg'),
 ('anker-helmet-action-mount','/images/p-actioncam.jpg')
) AS v(slug, url)
JOIN public.products p ON p.slug = v.slug;