import Image from 'next/image';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                {children}
            </div>
            <div className="hidden bg-muted lg:block">
                <Image
                    src="https://picsum.photos/seed/1/1920/1080"
                    alt="Image"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    data-ai-hint="office background"
                />
            </div>
        </div>
    );
}
