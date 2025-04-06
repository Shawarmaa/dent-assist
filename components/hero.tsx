'use client';
import Link from 'next/link';
import { useState } from 'react'

export default function HeroSection() {
    const [menuState, setMenuState] = useState(false)
    return (
        <>
            <header>
                <nav data-state={menuState && 'active'} className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-gray-950/50 lg:dark:bg-transparent">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                            <div className="flex w-full justify-between lg:w-auto">
                                <Link href="/" aria-label="home" className="flex items-center space-x-2">
                                    DentAssist AI
                                </Link>
                                
                            </div>

                            <div className="bg-ui mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-gray-300/20 group-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:group-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
                                <div className="lg:pr-4">
                                    <ul className="space-y-6 text-base lg:flex lg:gap-6 lg:space-y-0 lg:text-sm">
                                        <li>
                                            <Link href="#" className="text-body block hover:text-title">
                                                <span>Features</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/solution" className="text-body block hover:text-title">
                                                <span>Solution</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="text-body block hover:text-title">
                                                <span>Pricing</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="#" className="text-body block hover:text-title">
                                                <span>About</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                                    <Link href="#" className="btn variant-soft sz-md lg:sz-xs">
                                        <span>Login</span>
                                    </Link>
                                    <Link href="#" className="btn variant-neutral sz-md lg:sz-xs">
                                        <span className="btn-label">Sign Up</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <main>
                <div className="absolute inset-0 isolate z-[2] hidden contain-strict lg:block">
                    <div className="absolute left-0 top-0 h-[1280px] w-[560px] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]"></div>
                    <div className="absolute left-0 top-0 h-[1280px] w-[240px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]"></div>
                    <div className="absolute left-0 top-0 h-[1280px] w-[240px] -translate-y-[350px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div>
                </div>

                <section className="overflow-hidden bg-white dark:bg-transparent">
                    <div className="relative mx-auto max-w-5xl px-6 pt-28 lg:pt-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h1 className="text-title text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">Revolutionizing Dental Care with AI</h1>
                            <p className="text-body mx-auto mt-8 max-w-2xl text-xl">Empowering dentists with cutting-edge AI tools to enhance patient care, streamline workflows, and achieve precision like never before.</p>
                            <Link href="" className="btn variant-neutral sz-md mx-auto mt-8 w-fit">
                                <span className="btn-label">Explore DentAssist AI</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}