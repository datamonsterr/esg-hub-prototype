'use client';

import { H1, P } from '../ui';

type Props = {
    title: string;
    description: string;
    lastUpdated: string;
}

export const ReportHeader = ({ title, description, lastUpdated }: Props) => (
    <div className="p-10 rounded-lg bg-primary text-white flex justify-between items-center">
        <div>
            <H1 className="text-white font-bold text-4xl mb-4">{title}</H1>
            <P className="text-white text-lg">{description}</P>
        </div>
        <div>
            <P className="text-sm text-white">Last updated: {lastUpdated}</P>
        </div>
    </div>
); 