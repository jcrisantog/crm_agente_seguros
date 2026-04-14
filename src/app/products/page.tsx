import { insforge } from "@/lib/insforge";
import { ProductsList } from "@/components/products/ProductsList";

export const dynamic = 'force-dynamic';

async function getProducts() {
    const { data, error } = await insforge.database
        .from("products")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return data || [];
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <ProductsList initialProducts={products} />
        </div>
    );
}
