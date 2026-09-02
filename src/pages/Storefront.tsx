import { useSearchParams } from "react-router";
import CategoryStorefront from "@/components/CategoryStorefront";

/**
 * Storefront — public-facing store page.
 * In production, category comes from subdomain middleware (host.split('.')[0] → tenant.category).
 * For demo, we pass ?cat=cafe or default to cafe.
 */
export default function Storefront() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("cat") ?? "cafe";

  return <CategoryStorefront category={category} />;
}
