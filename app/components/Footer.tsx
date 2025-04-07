export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex h-16 items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Oxwell. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/aeither"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/aeither0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
