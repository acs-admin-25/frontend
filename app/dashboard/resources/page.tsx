"use client";

import React, { useState, useMemo } from "react";
import { gettingStartedSection } from "./getting-started";
import { coreFeaturesSection } from "./core-features";
import { aiFeaturesSection } from "./ai-features";
import { advancedFeaturesSection } from "./adv-features";
import { bestPracticesSection } from "./best-practices";
import { securitySection } from "./security";
import { troubleshootingSection } from "./troubleshooting";
import { usageAnalyticsSection } from "./usage-analysis";
import { faqSection } from "./faq";
import { ResourceSection, ResourceItem } from '../../../types/resources';
import { Search, BookOpen, Shield, Zap, BarChart3, Users, Mail, Calendar, Settings, HelpCircle, Star, TrendingUp, Lock, Eye, Clock, Target, MessageSquare, Phone, MapPin, FileText, CheckCircle, AlertCircle, Info, ArrowLeft, Home, Sparkles, Lightbulb, Award, Bookmark, ExternalLink, ChevronRight, Play, Pause, RotateCcw, Maximize2, Minimize2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { cn } from '@/lib/utils/utils';
import { applyTheme, greenTheme } from "../../../lib/theme/simple-theme";

function ResourcesContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('getting-started');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: Home },
    { id: 'core-features', label: 'Core Features', icon: Zap },
    { id: 'ai-features', label: 'AI Features', icon: Sparkles },
    { id: 'advanced-features', label: 'Advanced Features', icon: TrendingUp },
    { id: 'best-practices', label: 'Best Practices', icon: Award },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle },
    { id: 'usage-analytics', label: 'Usage Analytics', icon: BarChart3 }
  ];

  // Combine modular sections with the rest of the resourcesData
  const allSections = useMemo<ResourceSection[]>(() => [
    gettingStartedSection,
    coreFeaturesSection,
    aiFeaturesSection,
    advancedFeaturesSection,
    bestPracticesSection,
    securitySection,
    troubleshootingSection,
    usageAnalyticsSection,
    faqSection
  ], []);

  // Search functionality using centralized processing
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { tabs: tabs, items: [] };
    }

    const query = searchQuery.toLowerCase();
    const matchingTabs: typeof tabs = [];
    const matchingItems: Array<{ tabId: string; tabLabel: string; item: ResourceItem; itemIndex: number }> = [];

    tabs.forEach(tab => {
      const section = allSections.find(s => s.id === tab.id);
      if (!section) return;

      let tabHasMatches = false;
      
      if (section.title.toLowerCase().includes(query) || 
          (section.description && section.description.toLowerCase().includes(query))) {
        tabHasMatches = true;
      }

      section.content.forEach((item, itemIndex) => {
        let itemHasMatches = false;
        
        if (item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)) {
          itemHasMatches = true;
        }

        if (item.details) {
          item.details.forEach(detail => {
            if (detail.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (item.tips) {
          item.tips.forEach(tip => {
            if (tip.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (item.stepByStepGuide) {
          item.stepByStepGuide.forEach(step => {
            if (step.action.toLowerCase().includes(query) || 
                step.description.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (item.clientWorkflow) {
          item.clientWorkflow.forEach(workflow => {
            if (workflow.title.toLowerCase().includes(query) || 
                workflow.description.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (item.interactiveElements) {
          item.interactiveElements.forEach(element => {
            if (element.name.toLowerCase().includes(query) || 
                element.purpose.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (item.commonScenarios) {
          item.commonScenarios.forEach(scenario => {
            if (scenario.scenario.toLowerCase().includes(query) || 
                scenario.clientContext.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (item.troubleshootingSteps) {
          item.troubleshootingSteps.forEach(troubleshoot => {
            if (troubleshoot.issue.toLowerCase().includes(query)) {
              itemHasMatches = true;
            }
          });
        }

        if (itemHasMatches) {
          tabHasMatches = true;
          matchingItems.push({
            tabId: tab.id,
            tabLabel: tab.label,
            item,
            itemIndex
          });
        }
      });

      if (tabHasMatches) {
        matchingTabs.push(tab);
      }
    });

    return { tabs: matchingTabs, items: matchingItems };
  }, [searchQuery, allSections]);

  const getSectionContent = (sectionId: string) => {
    const section = allSections.find(s => s.id === sectionId);
    return section?.content || [];
  };

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isSearching = searchQuery.trim().length > 0;
  const displayTabs = isSearching ? searchResults.tabs : tabs;

  React.useEffect(() => {
    applyTheme(greenTheme);
  }, []);

  return (
    <div className="w-full bg-white overflow-auto" style={{ minHeight: '100vh' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors text-gray-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0a5a2f] via-[#0e6537] to-[#157a42] rounded-2xl mb-6 shadow-lg">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#0a2f1f] via-[#0e6537] to-[#157a42] bg-clip-text text-transparent mb-4">
            ACS Resources
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master ACS and transform your real estate business with our comprehensive resource library
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search resources, features, tips, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[#0e6537]/50 focus:border-[#0e6537] transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {isSearching && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Found {searchResults.items.length} matching items across {searchResults.tabs.length} sections
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
          {displayTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isSearchResult = isSearching && searchResults.tabs.some(t => t.id === tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm transition-all duration-200 font-medium text-sm sm:text-base",
                  isActive
                    ? 'bg-gradient-to-r from-[#0a5a2f] to-[#157a42] text-white scale-105 shadow-lg'
                    : isSearchResult
                    ? 'bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white border-2 border-[#f59e0b]'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                )}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">{tab.label}</span>
                {isSearchResult && !isActive && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {searchResults.items.filter(item => item.tabId === tab.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {isSearching ? (
            searchResults.items.length > 0 ? (
              searchResults.items.map((result, index) => (
                <div key={`${result.tabId}-${result.itemIndex}`} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Search Result Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-start sm:items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#f97316] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                            <Search className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm bg-[#f59e0b]/10 text-[#f59e0b] px-3 py-1 rounded-full font-medium">
                                {result.tabLabel}
                              </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                              {result.item.title}
                            </h3>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                              {result.item.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab(result.tabId);
                            setSearchQuery('');
                            setExpandedItems(new Set([result.itemIndex]));
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#0a5a2f] to-[#157a42] text-white rounded-lg hover:from-[#0e6537] hover:to-[#157a42] transition-all duration-200 font-medium w-full sm:w-auto"
                        >
                          View Full
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[#f59e0b] to-[#f97316] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Results Found</h3>
                <p className="text-base text-gray-600 max-w-md mx-auto mb-6">
                  Try searching with different keywords or browse through the tabs above.
                </p>
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0a5a2f] to-[#157a42] text-white px-6 py-3 rounded-xl font-medium hover:from-[#0e6537] hover:to-[#157a42] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <X className="w-5 h-5" />
                  <span>Clear Search</span>
                </button>
              </div>
            )
          ) : (
            // Show normal content with proper expansion
            getSectionContent(activeTab).map((item, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
                  {/* Item Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-start sm:items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0a5a2f] via-[#0e6537] to-[#157a42] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleItem(index)}
                        className="p-2 rounded-lg bg-[#0a5a2f] hover:bg-[#0e6537] transition-colors self-start sm:self-auto"
                      >
                        {expandedItems.has(index) ? (
                          <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems.has(index) && (
                    <div className="p-6 bg-gray-50">
                      {/* Details */}
                      {item.details && item.details.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Details</h4>
                          <ul className="space-y-2">
                            {item.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-[#0e6537] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {item.tips && item.tips.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Pro Tips</h4>
                          <ul className="space-y-2">
                            {item.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start space-x-3">
                                <Lightbulb className="w-5 h-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Step by Step Guide */}
                      {item.stepByStepGuide && item.stepByStepGuide.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Step by Step Guide</h4>
                          <div className="space-y-4">
                            {item.stepByStepGuide.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex space-x-4">
                                <div className="w-8 h-8 bg-[#0e6537] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                  {step.step}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">{step.action}</h5>
                                  <p className="text-gray-700 text-sm">{step.description}</p>
                                  {step.tips && step.tips.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-500 font-medium">Tips:</p>
                                      <ul className="mt-1 space-y-1">
                                        {step.tips.map((tip, tipIndex) => (
                                          <li key={tipIndex} className="text-xs text-gray-600">• {tip}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Client Workflow */}
                      {item.clientWorkflow && item.clientWorkflow.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Client Workflow</h4>
                          <div className="space-y-4">
                            {item.clientWorkflow.map((workflow, workflowIndex) => (
                              <div key={workflowIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-6 h-6 bg-[#0e6537] text-white rounded-full flex items-center justify-center font-semibold text-xs">
                                    {workflow.step}
                                  </div>
                                  <h5 className="font-medium text-gray-900">{workflow.title}</h5>
                                </div>
                                <p className="text-gray-700 text-sm mb-3">{workflow.description}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-600">Client Action:</span>
                                    <p className="text-gray-700">{workflow.clientAction}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Expected Outcome:</span>
                                    <p className="text-gray-700">{workflow.expectedOutcome}</p>
                                  </div>
                                </div>
                                <div className="mt-3 text-xs text-gray-500">
                                  Time Estimate: {workflow.timeEstimate}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Elements */}
                      {item.interactiveElements && item.interactiveElements.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Interactive Elements</h4>
                          <div className="space-y-3">
                            {item.interactiveElements.map((element, elementIndex) => (
                              <div key={elementIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-2">{element.name}</h5>
                                <p className="text-gray-700 text-sm mb-2">{element.purpose}</p>
                                <p className="text-gray-600 text-sm mb-3">
                                  <span className="font-medium">Location:</span> {element.location}
                                </p>
                                <p className="text-gray-700 text-sm mb-3">
                                  <span className="font-medium">How to use:</span> {element.howToUse}
                                </p>
                                {element.bestPractices && element.bestPractices.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Best Practices:</p>
                                    <ul className="space-y-1">
                                      {element.bestPractices.map((practice, practiceIndex) => (
                                        <li key={practiceIndex} className="text-xs text-gray-600">• {practice}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Common Scenarios */}
                      {item.commonScenarios && item.commonScenarios.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Common Scenarios</h4>
                          <div className="space-y-4">
                            {item.commonScenarios.map((scenario, scenarioIndex) => (
                              <div key={scenarioIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-2">{scenario.scenario}</h5>
                                <p className="text-gray-700 text-sm mb-3">{scenario.clientContext}</p>
                                <p className="text-gray-700 text-sm mb-3">
                                  <span className="font-medium">Recommended Action:</span> {scenario.recommendedAction}
                                </p>
                                {scenario.stepByStepProcess && scenario.stepByStepProcess.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Step by Step Process:</p>
                                    <ol className="space-y-1">
                                      {scenario.stepByStepProcess.map((step, stepIndex) => (
                                        <li key={stepIndex} className="text-xs text-gray-600">{stepIndex + 1}. {step}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                                <p className="text-gray-700 text-sm mb-2">
                                  <span className="font-medium">Expected Outcome:</span> {scenario.expectedOutcome}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Troubleshooting Steps */}
                      {item.troubleshootingSteps && item.troubleshootingSteps.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Troubleshooting</h4>
                          <div className="space-y-4">
                            {item.troubleshootingSteps.map((troubleshoot, troubleshootIndex) => (
                              <div key={troubleshootIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-2">{troubleshoot.issue}</h5>
                                {troubleshoot.symptoms && troubleshoot.symptoms.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Symptoms:</p>
                                    <ul className="space-y-1">
                                      {troubleshoot.symptoms.map((symptom, symptomIndex) => (
                                        <li key={symptomIndex} className="text-xs text-gray-600">• {symptom}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {troubleshoot.immediateActions && troubleshoot.immediateActions.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Immediate Actions:</p>
                                    <ul className="space-y-1">
                                      {troubleshoot.immediateActions.map((action, actionIndex) => (
                                        <li key={actionIndex} className="text-xs text-gray-600">• {action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {troubleshoot.preventiveMeasures && troubleshoot.preventiveMeasures.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Preventive Measures:</p>
                                    <ul className="space-y-1">
                                      {troubleshoot.preventiveMeasures.map((measure, measureIndex) => (
                                        <li key={measureIndex} className="text-xs text-gray-600">• {measure}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">When to Contact Support:</span> {troubleshoot.whenToContactSupport}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading resources..." />}>
        <ResourcesContent />
      </Suspense>
    </ErrorBoundary>
  );
}