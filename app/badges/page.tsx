import { redirect } from "next/navigation";

export default async function BadgesRedirectPage(props: { searchParams: Promise<{ highlight?: string }> }) {
    const { highlight } = await props.searchParams;
    
    if (highlight) {
        redirect(`/trophies?highlight=${highlight}`);
    } else {
        redirect("/trophies");
    }
}
