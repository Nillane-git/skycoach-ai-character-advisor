import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Страница не найдена
      </h1>
      <p className="max-w-md text-muted-foreground">
        Такой страницы не существует или регион персонажа не поддерживается.
        Попробуй найти персонажа на главной странице.
      </p>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        На главную
      </Link>
    </div>
  );
}
