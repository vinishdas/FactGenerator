function Footer() {
  return (
    <footer className="w-full border-t bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

        <p className="text-sm text-slate-600">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-medium text-slate-800">
            Fact Generator
          </span>. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm">
          <a
            href="#"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
