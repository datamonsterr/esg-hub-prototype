'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TraceabilityAssessmentProps {
  params: {
    id: string;
  };
  searchParams: {
    traceabilityRequestId?: string;
  };
}

export default function TraceabilityAssessmentPage({ params, searchParams }: TraceabilityAssessmentProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    materialSourcing: {
      leatherSuppliers: false,
      rubberSuppliers: false,
      textileSuppliers: false,
      syntheticMaterials: false,
    },
    leadTime: '',
    manufacturingDescription: '',
    qualityControl: {
      leatherInspection: false,
      soleAttachment: false,
      durabilityTesting: false,
      stitchingQuality: false,
    },
    averageDistance: '',
    transportationMethod: '',
    packaging: {
      recyclable: false,
      minimal: false,
      biodegradable: false,
      reusable: false,
    },
    distributionOptimization: '',
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (section: string, field: string) => {
    const currentSection = formData[section as keyof typeof formData] as Record<string, boolean>;
    handleInputChange(section, field, !currentSection[field]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting assessment:', formData);
    // In a real app, this would submit to the API
    alert('Assessment submitted successfully! Your suppliers will receive the assessment shortly.');
    if (searchParams.traceabilityRequestId) {
      router.push(`/supplier-traceability/${searchParams.traceabilityRequestId}`);
    } else {
      router.push('/supplier-traceability');
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    alert('Assessment saved as draft');
  };

  return (
    <main className="max-w-7xl mx-auto px-5 py-8">
      {/* Header Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Footwear Supply Chain Journey Mapping Assessment 2024</h1>
            <p className="text-gray-600">Complete your assessment to ensure compliance with supply chain requirements</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-primary flex items-center space-x-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </section>

      {/* Assessment Info Card */}
      <section className="mb-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Footwear Supply Chain Journey Mapping Assessment 2024</h2>
              <p className="text-gray-600 mt-1">Evaluate sustainability practices of material sourcing and processing</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
                <i className="fas fa-clock mr-1"></i>
                Due: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-1">Assessment Type</h4>
              <p className="text-sm text-gray-600">Material Sustainability</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-1">Assessment ID</h4>
              <p className="text-sm text-gray-600">{params.id}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-1">Progress</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/3"></div>
                </div>
                <span className="text-sm text-gray-600">33%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Form */}
      <section className="mb-8">
        <div className="bg-white rounded-lg border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Raw Material Sourcing */}
            <div className="border-b border-border pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <i className="fas fa-industry text-primary mr-2"></i>
                Raw Material Sourcing
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Map your footwear raw material suppliers by material type and geographic region</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.materialSourcing.leatherSuppliers}
                        onChange={() => handleCheckboxChange('materialSourcing', 'leatherSuppliers')}
                      />
                      <span className="text-gray-700">Leather suppliers - South America</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.materialSourcing.rubberSuppliers}
                        onChange={() => handleCheckboxChange('materialSourcing', 'rubberSuppliers')}
                      />
                      <span className="text-gray-700">Rubber suppliers - Southeast Asia</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.materialSourcing.textileSuppliers}
                        onChange={() => handleCheckboxChange('materialSourcing', 'textileSuppliers')}
                      />
                      <span className="text-gray-700">Textile suppliers - Europe</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.materialSourcing.syntheticMaterials}
                        onChange={() => handleCheckboxChange('materialSourcing', 'syntheticMaterials')}
                      />
                      <span className="text-gray-700">Synthetic materials - North America</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What is the average lead time from material sourcing to your facility?</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="lead-time" 
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        value="less-than-30"
                        checked={formData.leadTime === 'less-than-30'}
                        onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                      />
                      <span className="text-gray-700">Less than 30 days</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="lead-time" 
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        value="30-60"
                        checked={formData.leadTime === '30-60'}
                        onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                      />
                      <span className="text-gray-700">30-60 days</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="lead-time" 
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        value="60-90"
                        checked={formData.leadTime === '60-90'}
                        onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                      />
                      <span className="text-gray-700">60-90 days</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="lead-time" 
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        value="more-than-90"
                        checked={formData.leadTime === 'more-than-90'}
                        onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                      />
                      <span className="text-gray-700">More than 90 days</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload footwear material traceability documentation</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <i className="fas fa-cloud-arrow-up text-gray-400 text-2xl mb-2"></i>
                    <p className="text-sm text-gray-600">Certificate of Origin (LTR-001, RBR-305), Purchase invoices, Material composition certificates</p>
                    <button type="button" className="mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Manufacturing & Assembly */}
            <div className="border-b border-border pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <i className="fas fa-gears text-primary mr-2"></i>
                Footwear Manufacturing & Assembly
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Describe your key footwear manufacturing processes</label>
                  <textarea 
                    rows={4} 
                    placeholder="Describe cutting, stitching, lasting, sole attachment processes..."
                    className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    value={formData.manufacturingDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturingDescription: e.target.value }))}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Which quality control checkpoints exist in your footwear production line?</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.qualityControl.leatherInspection}
                        onChange={() => handleCheckboxChange('qualityControl', 'leatherInspection')}
                      />
                      <span className="text-gray-700">Leather quality inspection (LTR-001)</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.qualityControl.soleAttachment}
                        onChange={() => handleCheckboxChange('qualityControl', 'soleAttachment')}
                      />
                      <span className="text-gray-700">Sole attachment strength testing</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.qualityControl.durabilityTesting}
                        onChange={() => handleCheckboxChange('qualityControl', 'durabilityTesting')}
                      />
                      <span className="text-gray-700">Final shoe durability testing</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.qualityControl.stitchingQuality}
                        onChange={() => handleCheckboxChange('qualityControl', 'stitchingQuality')}
                      />
                      <span className="text-gray-700">Stitching quality control</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Distribution & Logistics */}
            <div className="pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <i className="fas fa-truck-fast text-primary mr-2"></i>
                Distribution & Logistics
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Average distribution distance (km)</label>
                    <input 
                      type="number" 
                      placeholder="Enter average distance" 
                      className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.averageDistance}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageDistance: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary transportation method</label>
                    <select 
                      className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.transportationMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, transportationMethod: e.target.value }))}
                    >
                      <option value="">Select transportation method</option>
                      <option value="road">Road transport</option>
                      <option value="air">Air freight</option>
                      <option value="sea">Sea freight</option>
                      <option value="rail">Rail transport</option>
                      <option value="multi-modal">Multi-modal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Packaging sustainability measures</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.packaging.recyclable}
                        onChange={() => handleCheckboxChange('packaging', 'recyclable')}
                      />
                      <span className="text-gray-700">Recyclable packaging materials</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.packaging.minimal}
                        onChange={() => handleCheckboxChange('packaging', 'minimal')}
                      />
                      <span className="text-gray-700">Minimal packaging design</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.packaging.biodegradable}
                        onChange={() => handleCheckboxChange('packaging', 'biodegradable')}
                      />
                      <span className="text-gray-700">Biodegradable packaging</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={formData.packaging.reusable}
                        onChange={() => handleCheckboxChange('packaging', 'reusable')}
                      />
                      <span className="text-gray-700">Reusable packaging solutions</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distribution network optimization</label>
                  <textarea 
                    rows={3} 
                    placeholder="Describe your distribution network optimization strategies..."
                    className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    value={formData.distributionOptimization}
                    onChange={(e) => setFormData(prev => ({ ...prev, distributionOptimization: e.target.value }))}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <i className="fas fa-paperclip text-primary mr-2"></i>
                Supporting Documents
              </h3>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <i className="fas fa-cloud-arrow-up text-gray-400 text-3xl mb-4"></i>
                <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
                <button type="button" className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                  Browse Files
                </button>
              </div>
            </div>

            {/* Cascade Note */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-circle-info text-accent mt-1"></i>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Cascade Requirement</h4>
                  <p className="text-sm text-gray-700">Once you submit this assessment, it will automatically cascade to your suppliers for completion. They will receive the same assessment with a 14-day deadline.</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button type="button" onClick={handleSaveDraft} className="text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                <i className="fas fa-floppy-disk"></i>
                <span>Save as Draft</span>
              </button>
              <div className="flex space-x-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-border rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary/90 flex items-center space-x-2">
                  <i className="fas fa-paper-plane"></i>
                  <span>Submit Assessment</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </section>

    </main>
  );
} 