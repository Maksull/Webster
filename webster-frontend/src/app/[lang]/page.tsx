'use client';

import {
    Wand2,
    Image as ImageIcon,
    Share2,
    Sparkles,
    Layers,
    BarChart2,
    ArrowRight,
    Star,
} from 'lucide-react';
import Link from 'next/link';
import { useDictionary } from '@/contexts/DictionaryContext';

export default function Home() {
    const { dict, lang } = useDictionary();

    const features = [
        {
            title: 'Easy Image Editing',
            description:
                'Transform your photos with our intuitive tools - no design experience needed. Adjust, crop, and enhance with just a few clicks.',
            icon: <ImageIcon className="w-6 h-6 text-white" />,
        },
        {
            title: 'AI-Powered Enhancement',
            description:
                'Let our AI technology analyze and enhance your images automatically, bringing out the best in every photo.',
            icon: <Wand2 className="w-6 h-6 text-white" />,
        },
        {
            title: 'Social Media Optimization',
            description:
                'Automatically resize and optimize your designs for any social platform. Get perfect dimensions every time.',
            icon: <Share2 className="w-6 h-6 text-white" />,
        },
        {
            title: 'Creative Templates',
            description:
                'Access hundreds of professionally designed templates for any occasion or purpose, fully customizable to your needs.',
            icon: <Sparkles className="w-6 h-6 text-white" />,
        },
        {
            title: 'Layer Management',
            description:
                'Work with multiple layers to create complex designs with ease. Add text, shapes, and effects in organized layers.',
            icon: <Layers className="w-6 h-6 text-white" />,
        },
        {
            title: 'Performance Analytics',
            description:
                'Track how your designs perform across platforms with detailed analytics and engagement metrics.',
            icon: <BarChart2 className="w-6 h-6 text-white" />,
        },
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                {/* Background Shape */}
                <div className="hidden lg:block absolute top-0 right-0 -mt-24 -mr-24">
                    <div className="text-purple-100 dark:text-purple-900/20 transform rotate-45">
                        <svg
                            width="400"
                            height="400"
                            viewBox="0 0 600 600"
                            xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(300,300)">
                                <path
                                    d="M153.6,-196.4C193.7,-161.3,217.9,-109.1,228.2,-54.7C238.6,-0.3,235,56.2,210.3,98.9C185.5,141.5,139.6,170.2,90,193.3C40.3,216.4,-13.1,233.9,-70.1,228.3C-127.1,222.8,-187.7,194.2,-215.8,147.5C-243.9,100.8,-239.6,36,-221.9,-19.8C-204.2,-75.7,-173.2,-122.7,-133.4,-157.8C-93.5,-192.9,-46.8,-216.2,4.7,-222.1C56.1,-228.1,113.4,-231.5,153.6,-196.4Z"
                                    fill="currentColor"
                                />
                            </g>
                        </svg>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                            <div className="lg:col-span-6">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">
                                        {dict.home.heroTitleFirst ||
                                            'Design Like a'}
                                    </span>
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 xl:inline">
                                        {' '}
                                        {dict.home.heroTitleSecond ||
                                            'Professional'}
                                    </span>
                                </h1>
                                <p className="mt-6 text-xl text-gray-500 dark:text-gray-300 max-w-3xl">
                                    {dict.home.heroDescription ||
                                        'Create stunning visuals without design skills. Our intuitive editor helps you craft perfect images for any platform with just a few clicks.'}
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={`/${lang}/register`}
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200">
                                        {dict.header.register ||
                                            'Start Creating'}{' '}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="flex -space-x-2">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 ${['bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-rose-400'][i]}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            10,000+{' '}
                                        </span>
                                        {dict.home.heroUsers ||
                                            'designers already using our platform'}
                                    </div>
                                </div>
                            </div>

                            {/* Editor Preview */}
                            <div className="mt-12 lg:mt-0 lg:col-span-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-300">
                                    <div className="px-1 py-1 sm:p-2">
                                        <div className="flex items-center gap-2 px-3 py-2">
                                            <div className="flex space-x-1">
                                                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                                                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                                                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
                                        </div>
                                        <div className="p-4 pt-2">
                                            <div className="editor-mockup bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="font-bold text-purple-600 dark:text-purple-400">
                                                        {dict.home
                                                            .editorTitle ||
                                                            'Webster Editor'}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <div className="h-6 w-6 bg-purple-100 dark:bg-purple-800/40 rounded flex items-center justify-center">
                                                            <Layers className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div className="h-6 w-6 bg-purple-100 dark:bg-purple-800/40 rounded flex items-center justify-center">
                                                            <Wand2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Canvas mockup */}
                                                <div className="relative h-64 bg-white dark:bg-gray-600 rounded-lg mb-4 overflow-hidden">
                                                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-2">
                                                        <div className="bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded"></div>
                                                        <div className="bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 rounded"></div>
                                                        <div className="bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded"></div>
                                                        <div className="bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 rounded"></div>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-2xl font-bold text-white bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                                                            {dict.home
                                                                .editorPlaceholder ||
                                                                'YOUR DESIGN'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Toolbar mockup */}
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {[
                                                        'Crop',
                                                        'Filters',
                                                        'Text',
                                                        'Effects',
                                                        'Layers',
                                                        'Export',
                                                    ].map(tool => (
                                                        <div
                                                            key={tool}
                                                            className="px-3 py-1 bg-white dark:bg-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {tool}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <p className="text-base text-purple-600 dark:text-purple-400 font-semibold tracking-wide uppercase">
                            {dict.home.featuresTitle || 'Features'}
                        </p>
                        <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            {dict.home.featuresSubtitle ||
                                'Everything you need to create amazing designs'}
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                            {dict.home.featuresDescription ||
                                'Powerful tools made simple. Transform your ideas into stunning visuals without the learning curve.'}
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className={`rounded-lg p-3 ${
                                                [
                                                    'bg-gradient-to-br from-purple-600 to-pink-600',
                                                    'bg-gradient-to-br from-blue-600 to-indigo-600',
                                                    'bg-gradient-to-br from-rose-600 to-red-600',
                                                    'bg-gradient-to-br from-amber-500 to-orange-600',
                                                    'bg-gradient-to-br from-emerald-500 to-teal-500',
                                                    'bg-gradient-to-br from-indigo-500 to-purple-500',
                                                ][index]
                                            } group-hover:shadow-lg transition-all duration-300`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">
                            {dict.home.ctaReady ||
                                'Ready to create amazing designs?'}
                        </span>
                        <span className="block text-purple-200">
                            {dict.home.ctaStart ||
                                'Start your creative journey today.'}
                        </span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 gap-4">
                        <Link
                            href={`/${lang}/register`}
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-purple-600 bg-white hover:bg-purple-50 shadow-md hover:shadow-lg transition-all duration-200">
                            {dict.home.getStarted || 'Get Started Free'}
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-all duration-200">
                            {dict.home.ctaLearn || 'Learn more'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        <div className="text-center">
                            <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                                {dict.home.testimonialsTitle ||
                                    'Loved by creators worldwide'}
                            </h2>
                            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
                                {dict.home.testimonialsSubtitle ||
                                    'See what our users are saying about their design experience'}
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Sara Johnson',
                                    role: 'Social Media Manager',
                                    quote: 'This platform has revolutionized how I create content for our social media channels. What used to take hours in Photoshop now takes minutes!',
                                    color: 'bg-purple-500',
                                },
                                {
                                    name: 'Alex Rivera',
                                    role: 'Small Business Owner',
                                    quote: 'As someone with zero design skills, this tool has been a game-changer for my business. I can now create professional marketing materials on my own.',
                                    color: 'bg-pink-500',
                                },
                                {
                                    name: 'Jordan Chen',
                                    role: 'Content Creator',
                                    quote: 'The AI-powered features save me so much time. The automatic background removal and image enhancement tools are absolute magic!',
                                    color: 'bg-indigo-500',
                                },
                            ].map((testimonial, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col">
                                    <div className="flex items-center mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                className="h-5 w-5 text-yellow-400 fill-current"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                                        {testimonial.quote}
                                    </p>
                                    <div className="flex items-center">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${testimonial.color}`}>
                                            {testimonial.name
                                                .split(' ')
                                                .map(n => n[0])
                                                .join('')}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
