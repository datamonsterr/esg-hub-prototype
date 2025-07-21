import { LoadingProgress } from '@/src/components/ui/loading-progress'
import React, { Suspense } from 'react'

function AssessmentLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<LoadingProgress />}>
            {children}
        </Suspense>
    )
}

export default AssessmentLayout