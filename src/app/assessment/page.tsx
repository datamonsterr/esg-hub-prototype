'use client';

import { useState, useEffect } from 'react';
import { useSearchAssessments } from '@/src/api/assessment';
import { Assessment, AssessmentTemplate } from '@/src/types/assessment';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { GlobalLoading } from '@/src/components/global-loading';
import { ErrorComponent } from '@/src/components/ui/error';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
import CreateAssessmentModal from '@/src/components/supplier-assessment/create-assessment-modal';
import { getUserById } from '@/src/lib/user-utils';

export default function SupplierAssessmentPage() {
  const { assessments, totalPages, isLoading, isError } = useSearchAssessments();

  // Modal state and template selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  // Mock templates (should be fetched from API in real app)
  const mockTemplates: AssessmentTemplate[] = [
    {
      id: 1,
      createdByOrganizationId: 1,
      title: 'Blank Template',
      description: 'Start from scratch with a blank assessment.',
      icon: 'fa-file',
      recommended: false,
      schema: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: { category: 'General', sections: 0, questions: 0, time: '5 min', completion: 'N/A', sample: [] },
    },
    {
      id: 2,
      createdByOrganizationId: 1,
      title: 'Origin Verification',
      description: 'Verify product origin and documentation.',
      icon: 'fa-globe',
      recommended: true,
      lastUsed: '2024-05-01',
      schema: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: { category: 'Compliance', sections: 3, questions: 10, time: '20 min', completion: '85%', sample: ['What is the country of origin?', 'Is there a certificate of origin?'] },
    },
  ];

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Data" description="There was an error loading the assessment data. Please try again later." />;
  }

  return (
    <div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader onOpenModal={() => setIsModalOpen(true)} />
        <SearchAndFilter />
        <AssessmentGrid assessments={assessments || []} />
        <Pagination totalPages={totalPages} />
        <CreateAssessmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          templates={mockTemplates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      </main>
    </div>
  );
}

function PageHeader({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section id="page-header" className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Supplier Assessment
          </h1>
          <p className="text-gray-600">
            Evaluate supplier risks, material origins, and tariff implications
            for strategic sourcing decisions
          </p>
        </div>
        <Button
          id="create-assessment-btn"
          onClick={onOpenModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Assessment
        </Button>
      </div>
    </section>
  );
}

function SearchAndFilter() {
  const router = useRouter();

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value) {
      params.set('title', e.target.value);
    } else {
      params.delete('title');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, 300);

  return (
    <section id="search-filter" className="mb-8">
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assessments..."
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssessmentGrid({ assessments }: { assessments: Assessment[] }) {
  if (!assessments || assessments.length === 0) {
    return (
      <section id="assessment-grid" className="mb-8">
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clipboard-list text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first assessment or check back later for new requests.
            </p>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
              Create Assessment
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="assessment-grid" className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>
    </section>
  );
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const {
    title,
    description,
    topic,
    createdBy,
    createdAt,
    updatedAt,
    status,
    tags,
    icon,
    topicColor,
  } = assessment;

  const [creatorEmail, setCreatorEmail] = useState<string>('Loading...');

  useEffect(() => {
    async function fetchCreatorEmail() {
      try {
        const user = await getUserById(createdBy);
        setCreatorEmail(user?.organizations?.email || 'Unknown');
      } catch (error) {
        console.error('Error fetching creator email:', error);
        setCreatorEmail('Error fetching email');
      }
    }

    fetchCreatorEmail();
  }, [createdBy]);

  // Function to format date strings to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Generate random icon and color if not provided
  const defaultIcons = ['fa-file-alt', 'fa-leaf', 'fa-users', 'fa-shield-alt', 'fa-chart-line', 'fa-cog'];
  const defaultColors = ['blue', 'green', 'purple', 'orange', 'red'] as const;

  const displayIcon = icon || defaultIcons[assessment.id % defaultIcons.length];
  const displayColor = (topicColor as keyof typeof iconColorClasses) || defaultColors[assessment.id % defaultColors.length];

  // Convert status to match our classes (handle CSV data format)
  const normalizeStatus = (status: string) => {
    const statusMap: { [key: string]: keyof typeof statusClasses } = {
      'Complete': 'complete',
      'Completed': 'complete',
      'complete': 'complete',
      'Draft': 'draft',
      'draft': 'draft',
      'In Progress': 'in_progress',
      'in_progress': 'in_progress',
      'Pending': 'draft',
      'pending': 'draft',
    };
    return statusMap[status] || 'draft';
  };

  const normalizedStatus = normalizeStatus(status);

  const statusClasses = {
    complete: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-accent/20 text-accent',
  };

  const iconColorClasses = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 ${iconColorClasses[topicColor as keyof typeof iconColorClasses]
              } rounded-lg flex items-center justify-center`}
          >
            <i className={`fas ${icon} text-sm`}></i>
          </div>
          <span
            className={`px-2 py-1 ${iconColorClasses[topicColor as keyof typeof iconColorClasses]
              } text-xs rounded`}
          >
            {topic}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Created:</span>
          <span className="text-gray-900">{formatDate(createdAt)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Creator:</span>
          <span className="text-gray-900">{creatorEmail}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last Updated:</span>
          <span className="text-gray-900">{formatDate(updatedAt)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {tags?.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-secondary/50 text-primary text-xs rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 ${statusClasses[normalizedStatus]
            } text-xs rounded`}
        >
          {normalizedStatus}
        </span>
        <Link href={`/assessment/preview/${assessment.id}`}>
          <span className="text-primary text-sm font-medium hover:underline">
            View Details →
          </span>
        </Link>
      </div>
    </div>
  );
}


function Pagination({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  }

  return (
    <section id="pagination" className="flex justify-end items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight />
      </Button>
    </section>
  );
}

