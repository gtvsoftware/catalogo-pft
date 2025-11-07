'use client'

import { Button } from '@terraviva/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@terraviva/ui/card'
import { Input } from '@terraviva/ui/input'
import { Label } from '@terraviva/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@terraviva/ui/tabs'
import { Textarea } from '@terraviva/ui/textarea'
import {
  Calendar,
  ChevronLeft,
  Eye,
  FileText,
  Grid,
  Image,
  Layout,
  Menu,
  Phone,
  Plus,'use client'

import
{
  Button
}
from
;('@/components/ui/button')

import {
  AlignCenter,
  AlignLeft,
  Calendar,
  Check,
  ChevronLeft,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Grid,
  Image,
  Layout,
  Menu,
  Phone,
  Plus,
  Save,
  Settings,
  Trash2,
  Type,
  User,
  X
} from 'lucide-react'
import React, { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

export default function FlowerCatalogBuilder() {
  const [catalogInfo, setCatalogInfo] = useState({
    catalogName: 'Spring Collection 2025',
    vendorName: '',
    phoneContact: '',
    availabilityStart: '',
    availabilityEnd: ''
  })

  const [coverSettings, setCoverSettings] = useState({
    enabled: true,
    title: 'Beautiful Flowers',
    subtitle: 'Fresh blooms delivered daily',
    layout: 'center', // 'center' or 'left'
    backgroundType: 'color', // 'color' or 'image'
    backgroundColor: '#ec4899',
    backgroundImage: ''
  })

  const [editingCover, setEditingCover] = useState(false)

  const colorOptions = [
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' }
  ]

  const [blocks, setBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [viewMode, setViewMode] = useState('edit')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const blockTypes = [
    { id: 'product', icon: Image, label: 'Product Card', color: 'bg-blue-500' },
    { id: 'grid', icon: Grid, label: 'Product Grid', color: 'bg-green-500' },
    { id: 'text', icon: Type, label: 'Text Block', color: 'bg-orange-500' }
  ]

  const updateCatalogInfo = (field, value) => {
    setCatalogInfo({ ...catalogInfo, [field]: value })
  }

  const updateCoverSettings = (field, value) => {
    setCoverSettings({ ...coverSettings, [field]: value })
  }

  const addBlock = type => {
    const newBlock = {
      id: Date.now(),
      type,
      data: getDefaultData(type)
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlock(newBlock.id)
    setSidebarOpen(true)
  }

  const getDefaultData = type => {
    switch (type) {
      case 'product':
        return {
          name: 'Rose Bouquet',
          price: '$49.99',
          description: 'Fresh red roses',
          image: ''
        }
      case 'grid':
        return { columns: 2, products: [] }
      case 'text':
        return { content: 'Enter your text here...' }
      default:
        return {}
    }
  }

  const updateBlock = (id, newData) => {
    setBlocks(
      blocks.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...newData } } : b
      )
    )
  }

  const deleteBlock = id => {
    setBlocks(blocks.filter(b => b.id !== id))
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const renderBlock = (block, isPreview = false) => {
    const { type, data } = block

    switch (type) {
      case 'product':
        return (
          <Card className="overflow-hidden">
            <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
              {data.image ? (
                <img
                  src={data.image}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              )}
            </div>
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-bold text-base sm:text-lg mb-1">
                {data.name}
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                {data.price}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {data.description}
              </p>
            </CardContent>
          </Card>
        )

      case 'grid':
        return (
          <div
            className={`grid grid-cols-${Math.min(data.columns, 2)} sm:grid-cols-${data.columns} gap-3 sm:gap-4`}
          >
            {[...Array(data.columns * 2)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-24 sm:h-32 bg-gray-200" />
                <CardContent className="p-2 sm:p-3">
                  <p className="font-semibold text-sm">Product {i + 1}</p>
                  <p className="text-green-600 text-xs sm:text-sm">$XX.XX</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'text':
        return (
          <div className="prose prose-sm sm:prose max-w-none">
            <p className="text-gray-700">{data.content}</p>
          </div>
        )

      default:
        return null
    }
  }

  const renderEditor = block => {
    if (!block)
      return (
        <div className="flex items-center justify-center h-full text-gray-400 py-8">
          <p className="text-sm">Select a block to edit</p>
        </div>
      )

    const { type, data } = block

    switch (type) {
      case 'product':
        return (
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={data.name}
                onChange={e => updateBlock(block.id, { name: e.target.value })}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                value={data.price}
                onChange={e => updateBlock(block.id, { price: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={data.description}
                onChange={e =>
                  updateBlock(block.id, { description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={data.image}
                onChange={e => updateBlock(block.id, { image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="space-y-4">
            <div>
              <Label>Columns (Desktop)</Label>
              <Input
                type="number"
                min="1"
                max="4"
                value={data.columns}
                onChange={e =>
                  updateBlock(block.id, { columns: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Mobile always shows max 2 columns
              </p>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Content</Label>
              <Textarea
                value={data.content}
                onChange={e =>
                  updateBlock(block.id, { content: e.target.value })
                }
                rows={6}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const formatDateRange = () => {
    if (!catalogInfo.availabilityStart && !catalogInfo.availabilityEnd)
      return ''

    const start = catalogInfo.availabilityStart
      ? new Date(catalogInfo.availabilityStart).toLocaleDateString()
      : 'N/A'
    const end = catalogInfo.availabilityEnd
      ? new Date(catalogInfo.availabilityEnd).toLocaleDateString()
      : 'N/A'

    return `${start} - ${end}`
  }

  const getCoverStyle = () => {
    if (coverSettings.backgroundType === 'image' && coverSettings.backgroundImage) {
      return {
        backgroundImage: `url(${coverSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {
      backgroundColor: coverSettings.backgroundColor
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
              Catalog Builder
            </h1>
            {catalogInfo.catalogName && (
              <span className="text-xs sm:text-sm text-gray-500 truncate block lg:inline lg:border-l lg:pl-3 lg:ml-3">
                {catalogInfo.catalogName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              <Settings className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <Button variant="default" size="sm" className="flex-shrink-0">
            <Save className="w-4 h-4 sm:mr-1" />{' '}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Mobile View Mode Switcher */}
      <div className="sm:hidden bg-white border-b px-3 py-2 flex gap-2">
        <Button
          variant={viewMode === 'edit' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => setViewMode('edit')}
        >
          <Settings className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => setViewMode('preview')}
        >
          <Eye className="w-4 h-4 mr-1" /> Preview
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Preview Area */}
        <div
          className={`
          flex-1 overflow-auto bg-gray-100 
          ${viewMode === 'edit' ? 'hidden sm:block' : 'block'}
        `}
        >
          <div className="p-3 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
              {/* Catalog Cover */}
              {coverSettings.enabled && (
                <div 
                  className="relative h-64 sm:h-80 md:h-96 rounded-t-lg overflow-hidden group"
                  style={getCoverStyle()}
                  onClick={() => setEditingCover(true)}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  <div className={`absolute inset-0 flex flex-col ${coverSettings.layout === 'center' ? 'items-center justify-center' : 'items-start justify-center pl-8 sm:pl-12 md:pl-16'} text-white p-4 sm:p-6 md:p-8`}>
                    {editingCover ? (
                      <div className="w-full max-w-2xl space-y-4 z-10">
                        <div>
                          <Input
                            value={coverSettings.title}
                            onChange={e => updateCoverSettings('title', e.target.value)}
                            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border-white/30"
                            placeholder="Cover Title"
                          />
                        </div>
                        <div>
                          <Input
                            value={coverSettings.subtitle}
                            onChange={e => updateCoverSettings('subtitle', e.target.value)}
                            className="text-base sm:text-lg bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border-white/30"
                            placeholder="Cover Subtitle (optional)"
                          />
                        </div>
                        
                        {/* Cover Controls */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <div className="flex gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
                            <Button
                              size="sm"
                              variant={coverSettings.layout === 'center' ? 'default' : 'ghost'}
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateCoverSettings('layout', 'center')
                              }}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={coverSettings.layout === 'left' ? 'default' : 'ghost'}
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateCoverSettings('layout', 'left')
                              }}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
                            <Button
                              size="sm"
                              variant={coverSettings.backgroundType === 'color' ? 'default' : 'ghost'}
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateCoverSettings('backgroundType', 'color')
                              }}
                            >
                              Color
                            </Button>
                            <Button
                              size="sm"
                              variant={coverSettings.backgroundType === 'image' ? 'default' : 'ghost'}
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateCoverSettings('backgroundType', 'image')
                              }}
                            >
                              Image
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateCoverSettings('enabled', false)
                              setEditingCover(false)
                            }}
                          >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Disable Cover
                          </Button>
                        </div>

                        {coverSettings.backgroundType === 'color' && (
                          <div className="grid grid-cols-8 gap-2">
                            {colorOptions.map(color => (
                              <button
                                key={color.value}
                                className={`h-10 rounded-lg border-2 transition-all ${
                                  coverSettings.backgroundColor === color.value
                                    ? 'border-white scale-105'
                                    : 'border-white/30 hover:border-white/60'
                                }`}
                                style={{ backgroundColor: color.value }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateCoverSettings('backgroundColor', color.value)
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        )}

                        {coverSettings.backgroundType === 'image' && (
                          <Input
                            value={coverSettings.backgroundImage}
                            onChange={e => updateCoverSettings('backgroundImage', e.target.value)}
                            className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border-white/30"
                            placeholder="Image URL (https://...)"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}

                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCover(false)
                          }}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Done Editing
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 ${coverSettings.layout === 'center' ? 'text-center' : 'text-left'}`}>
                          {coverSettings.title}
                        </h1>
                        {coverSettings.subtitle && (
                          <p className={`text-base sm:text-lg md:text-xl ${coverSettings.layout === 'center' ? 'text-center' : 'text-left'}`}>
                            {coverSettings.subtitle}
                          </p>
                        )}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCover(true)
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Cover
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!coverSettings.enabled && (
                <div className="border-b p-4 bg-gray-50 flex items-center justify-center gap-4">
                  <p className="text-sm text-gray-500">Cover is disabled</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCoverSettings('enabled', true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Enable Cover
                  </Button>
                </div>
              )}

              {/* Catalog Info Bar */}
              <div className="bg-gray-50 border-b p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  {catalogInfo.vendorName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                      <span className="truncate text-gray-700">{catalogInfo.vendorName}</span>
                    </div>
                  )}
                  {catalogInfo.phoneContact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                      <span className="truncate text-gray-700">
                        {catalogInfo.phoneContact}
                      </span>
                    </div>
                  )}
                  {(catalogInfo.availabilityStart ||
                    catalogInfo.availabilityEnd) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                      <span className="truncate text-gray-700">{formatDateRange()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 sm:p-6 md:p-8">
                {blocks.length === 0 ? (
                  <div className="h-64 sm:h-96 flex flex-col items-center justify-center text-gray-400">
                    <Plus className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                    <p className="text-base sm:text-lg font-medium">
                      Start building your catalog
                    </p>
                    <p className="text-xs sm:text-sm">
                      Add blocks from the right panel
                    </p>
                    <Button
                      className="mt-4 sm:hidden"
                      onClick={() => {
                        setSidebarOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Blocks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {blocks.map(block => (
                      <div
                        key={block.id}
                        className={`relative group ${selectedBlock === block.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                        onClick={() => {
                          setSelectedBlock(block.id)
                          setSidebarOpen(true)
                        }}
                      >
                        {renderBlock(block, true)}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={e => {
                              e.stopPropagation()
                              deleteBlock(block.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Responsive */}
        <div
          className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 right-0 z-40
          w-full sm:w-96 bg-white border-l flex flex-col
          ${viewMode === 'preview' ? 'hidden lg:hidden' : ''}
        `}
        >
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Editor</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Tabs
            defaultValue="info"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 m-3 sm:m-4 mb-0">
              <TabsTrigger
                value="info"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="blocks"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Blocks</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="info"
              className="flex-1 overflow-auto p-3 sm:p-4 m-0"
            >
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="catalogName" className="text-sm">
                        Catalog Name *
                      </Label>
                      <Input
                        id="catalogName"
                        value={catalogInfo.catalogName}
                        onChange={e =>
                          updateCatalogInfo('catalogName', e.target.value)
                        }
                        placeholder="e.g., Spring Collection 2025"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vendorName" className="text-sm">
                        Vendor Name *
                      </Label>
                      <Input
                        id="vendorName"
                        value={catalogInfo.vendorName}
                        onChange={e =>
                          updateCatalogInfo('vendorName', e.target.value)
                        }
                        placeholder="e.g., Blooms & Petals"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="phoneContact" className="text-sm">
                        Phone Contact (Call Back) *
                      </Label>
                      <Input
                        id="phoneContact"
                        type="tel"
                        value={catalogInfo.phoneContact}
                        onChange={e =>
                          updateCatalogInfo('phoneContact', e.target.value)
                        }
                        placeholder="e.g., +1 (555) 123-4567"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Customers will use this number to place orders
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Availability Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="availabilityStart" className="text-sm">
                        Start Date *
                      </Label>
                      <Input
                        id="availabilityStart"
                        type="date"
                        value={catalogInfo.availabilityStart}
                        onChange={e =>
                          updateCatalogInfo('availabilityStart', e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="availabilityEnd" className="text-sm">
                        End Date *
                      </Label>
                      <Input
                        id="availabilityEnd"
                        type="date"
                        value={catalogInfo.availabilityEnd}
                        onChange={e =>
                          updateCatalogInfo('availabilityEnd', e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>

                    {(catalogInfo.availabil
  Save,
  Settings,
  Trash2,
  Type,
  User,
  X
} from 'lucide-react'
import React, { useState } from 'react'

export default function FlowerCatalogBuilder() {
  const [catalogInfo, setCatalogInfo] = useState({
    catalogName: 'Spring Collection 2025',
    vendorName: '',
    phoneContact: '',
    availabilityStart: '',
    availabilityEnd: ''
  })

  const [coverSettings, setCoverSettings] = useState({
    title: 'Beautiful Flowers',
    subtitle: 'Fresh blooms delivered daily',
    backgroundType: 'color', // 'color' or 'image'
    backgroundColor: '#ec4899', // Default pink
    backgroundImage: ''
  })

  const colorOptions = [
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' }
  ]

  const [blocks, setBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [viewMode, setViewMode] = useState('edit')
  const [activeTab, setActiveTab] = useState('info')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const blockTypes = [
    { id: 'product', icon: Image, label: 'Product Card', color: 'bg-blue-500' },
    { id: 'grid', icon: Grid, label: 'Product Grid', color: 'bg-green-500' },
    { id: 'text', icon: Type, label: 'Text Block', color: 'bg-orange-500' }
  ]

  const updateCatalogInfo = (field, value) => {
    setCatalogInfo({ ...catalogInfo, [field]: value })
  }

  const updateCoverSettings = (field, value) => {
    setCoverSettings({ ...coverSettings, [field]: value })
  }

  const addBlock = type => {
    const newBlock = {
      id: Date.now(),
      type,
      data: getDefaultData(type)
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlock(newBlock.id)
    setActiveTab('blocks')
    setSidebarOpen(true)
  }

  const getDefaultData = type => {
    switch (type) {
      case 'product':
        return {
          name: 'Rose Bouquet',
          price: '$49.99',
          description: 'Fresh red roses',
          image: ''
        }
      case 'grid':
        return { columns: 2, products: [] }
      case 'text':
        return { content: 'Enter your text here...' }
      default:
        return {}
    }
  }

  const updateBlock = (id, newData) => {
    setBlocks(
      blocks.map(b =>
        b.id === id ? { ...b, data: { ...b.data, ...newData } } : b
      )
    )
  }

  const deleteBlock = id => {
    setBlocks(blocks.filter(b => b.id !== id))
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const renderBlock = (block, isPreview = false) => {
    const { type, data } = block

    switch (type) {
      case 'product':
        return (
          <Card className="overflow-hidden">
            <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
              {data.image ? (
                <img
                  src={data.image}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              )}
            </div>
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-bold text-base sm:text-lg mb-1">
                {data.name}
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                {data.price}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {data.description}
              </p>
            </CardContent>
          </Card>
        )

      case 'grid':
        return (
          <div
            className={`grid grid-cols-${Math.min(data.columns, 2)} sm:grid-cols-${data.columns} gap-3 sm:gap-4`}
          >
            {[...Array(data.columns * 2)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-24 sm:h-32 bg-gray-200" />
                <CardContent className="p-2 sm:p-3">
                  <p className="font-semibold text-sm">Product {i + 1}</p>
                  <p className="text-green-600 text-xs sm:text-sm">$XX.XX</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'text':
        return (
          <div className="prose prose-sm sm:prose max-w-none">
            <p className="text-gray-700">{data.content}</p>
          </div>
        )

      default:
        return null
    }
  }

  const renderEditor = block => {
    if (!block)
      return (
        <div className="flex items-center justify-center h-full text-gray-400 py-8">
          <p className="text-sm">Select a block to edit</p>
        </div>
      )

    const { type, data } = block

    switch (type) {
      case 'product':
        return (
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={data.name}
                onChange={e => updateBlock(block.id, { name: e.target.value })}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                value={data.price}
                onChange={e => updateBlock(block.id, { price: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={data.description}
                onChange={e =>
                  updateBlock(block.id, { description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={data.image}
                onChange={e => updateBlock(block.id, { image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="space-y-4">
            <div>
              <Label>Columns (Desktop)</Label>
              <Input
                type="number"
                min="1"
                max="4"
                value={data.columns}
                onChange={e =>
                  updateBlock(block.id, { columns: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Mobile always shows max 2 columns
              </p>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Content</Label>
              <Textarea
                value={data.content}
                onChange={e =>
                  updateBlock(block.id, { content: e.target.value })
                }
                rows={6}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const formatDateRange = () => {
    if (!catalogInfo.availabilityStart && !catalogInfo.availabilityEnd)
      return ''

    const start = catalogInfo.availabilityStart
      ? new Date(catalogInfo.availabilityStart).toLocaleDateString()
      : 'N/A'
    const end = catalogInfo.availabilityEnd
      ? new Date(catalogInfo.availabilityEnd).toLocaleDateString()
      : 'N/A'

    return `${start} - ${end}`
  }

  const getCoverStyle = () => {
    if (
      coverSettings.backgroundType === 'image' &&
      coverSettings.backgroundImage
    ) {
      return {
        backgroundImage: `url(${coverSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {
      backgroundColor: coverSettings.backgroundColor
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="bg-white border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
              Catalog Builder
            </h1>
            {catalogInfo.catalogName && (
              <span className="text-xs sm:text-sm text-gray-500 truncate block lg:inline lg:border-l lg:pl-3 lg:ml-3">
                {catalogInfo.catalogName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              <Settings className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
          <Button variant="default" size="sm" className="flex-shrink-0">
            <Save className="w-4 h-4 sm:mr-1" />{' '}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Mobile View Mode Switcher */}
      <div className="sm:hidden bg-white border-b px-3 py-2 flex gap-2">
        <Button
          variant={viewMode === 'edit' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => setViewMode('edit')}
        >
          <Settings className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => setViewMode('preview')}
        >
          <Eye className="w-4 h-4 mr-1" /> Preview
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Responsive */}
        <div
          className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 left-0 z-40
          w-full sm:w-96 bg-white border-r flex flex-col
          ${viewMode === 'preview' ? 'hidden lg:hidden' : ''}
        `}
        >
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Editor</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3 m-3 sm:m-4 mb-0">
              <TabsTrigger
                value="info"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="cover"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Layout className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Cover</span>
              </TabsTrigger>
              <TabsTrigger
                value="blocks"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Blocks</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="info"
              className="flex-1 overflow-auto p-3 sm:p-4 m-0"
            >
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="catalogName" className="text-sm">
                        Catalog Name *
                      </Label>
                      <Input
                        id="catalogName"
                        value={catalogInfo.catalogName}
                        onChange={e =>
                          updateCatalogInfo('catalogName', e.target.value)
                        }
                        placeholder="e.g., Spring Collection 2025"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vendorName" className="text-sm">
                        Vendor Name *
                      </Label>
                      <Input
                        id="vendorName"
                        value={catalogInfo.vendorName}
                        onChange={e =>
                          updateCatalogInfo('vendorName', e.target.value)
                        }
                        placeholder="e.g., Blooms & Petals"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="phoneContact" className="text-sm">
                        Phone Contact (Call Back) *
                      </Label>
                      <Input
                        id="phoneContact"
                        type="tel"
                        value={catalogInfo.phoneContact}
                        onChange={e =>
                          updateCatalogInfo('phoneContact', e.target.value)
                        }
                        placeholder="e.g., +1 (555) 123-4567"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Customers will use this number to place orders
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Availability Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="availabilityStart" className="text-sm">
                        Start Date *
                      </Label>
                      <Input
                        id="availabilityStart"
                        type="date"
                        value={catalogInfo.availabilityStart}
                        onChange={e =>
                          updateCatalogInfo('availabilityStart', e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="availabilityEnd" className="text-sm">
                        End Date *
                      </Label>
                      <Input
                        id="availabilityEnd"
                        type="date"
                        value={catalogInfo.availabilityEnd}
                        onChange={e =>
                          updateCatalogInfo('availabilityEnd', e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>

                    {(catalogInfo.availabilityStart ||
                      catalogInfo.availabilityEnd) && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium">
                          Available Period
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDateRange()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              value="cover"
              className="flex-1 overflow-auto p-3 sm:p-4 m-0"
            >
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base">
                      Cover Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                    <div>
                      <Label htmlFor="coverTitle" className="text-sm">
                        Title *
                      </Label>
                      <Input
                        id="coverTitle"
                        value={coverSettings.title}
                        onChange={e =>
                          updateCoverSettings('title', e.target.value)
                        }
                        placeholder="e.g., Beautiful Flowers"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="coverSubtitle" className="text-sm">
                        Subtitle (Optional)
                      </Label>
                      <Input
                        id="coverSubtitle"
                        value={coverSettings.subtitle}
                        onChange={e =>
                          updateCoverSettings('subtitle', e.target.value)
                        }
                        placeholder="e.g., Fresh blooms delivered daily"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-sm sm:text-base">
                      Background Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                    <div className="flex gap-2">
                      <Button
                        variant={
                          coverSettings.backgroundType === 'color'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateCoverSettings('backgroundType', 'color')
                        }
                      >
                        Color
                      </Button>
                      <Button
                        variant={
                          coverSettings.backgroundType === 'image'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateCoverSettings('backgroundType', 'image')
                        }
                      >
                        Image
                      </Button>
                    </div>

                    {coverSettings.backgroundType === 'color' && (
                      <div>
                        <Label className="text-sm mb-2 block">
                          Select Color
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map(color => (
                            <button
                              key={color.value}
                              className={`h-12 rounded-lg border-2 transition-all ${
                                coverSettings.backgroundColor === color.value
                                  ? 'border-gray-900 scale-105'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() =>
                                updateCoverSettings(
                                  'backgroundColor',
                                  color.value
                                )
                              }
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {coverSettings.backgroundType === 'image' && (
                      <div>
                        <Label htmlFor="coverImage" className="text-sm">
                          Image URL
                        </Label>
                        <Input
                          id="coverImage"
                          value={coverSettings.backgroundImage}
                          onChange={e =>
                            updateCoverSettings(
                              'backgroundImage',
                              e.target.value
                            )
                          }
                          placeholder="https://..."
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use a high-quality image for best results
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              value="blocks"
              className="flex-1 flex flex-col m-0 overflow-hidden"
            >
              {/* Block Types */}
              <div className="p-3 sm:p-4 border-b">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Add Blocks
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {blockTypes.map(({ id, icon: Icon, label, color }) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto py-2 sm:py-3"
                      onClick={() => {
                        addBlock(id)
                        setSidebarOpen(false)
                      }}
                    >
                      <div
                        className={`${color} w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center mr-2`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Block Properties */}
              <div className="flex-1 overflow-auto p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {selectedBlock ? 'Block Properties' : 'Select a Block'}
                </h3>
                {renderEditor(blocks.find(b => b.id === selectedBlock))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Preview Area */}
        <div
          className={`
          flex-1 overflow-auto bg-gray-100 
          ${viewMode === 'edit' ? 'hidden sm:block' : 'block'}
        `}
        >
          <div className="p-3 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
              {/* Catalog Cover */}
              <div
                className="relative h-64 sm:h-80 md:h-96 rounded-t-lg overflow-hidden"
                style={getCoverStyle()}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 sm:p-6 md:p-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-center">
                    {coverSettings.title}
                  </h1>
                  {coverSettings.subtitle && (
                    <p className="text-base sm:text-lg md:text-xl text-center">
                      {coverSettings.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Catalog Info Bar */}
              <div className="bg-gray-50 border-b p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  {catalogInfo.vendorName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                      <span className="truncate text-gray-700">
                        {catalogInfo.vendorName}
                      </span>
                    </div>
                  )}
                  {catalogInfo.phoneContact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                      <span className="truncate text-gray-700">
                        {catalogInfo.phoneContact}
                      </span>
                    </div>
                  )}
                  {(catalogInfo.availabilityStart ||
                    catalogInfo.availabilityEnd) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                      <span className="truncate text-gray-700">
                        {formatDateRange()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 sm:p-6 md:p-8">
                {blocks.length === 0 ? (
                  <div className="h-64 sm:h-96 flex flex-col items-center justify-center text-gray-400">
                    <Plus className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                    <p className="text-base sm:text-lg font-medium">
                      Start building your catalog
                    </p>
                    <p className="text-xs sm:text-sm">
                      Add blocks from the left panel
                    </p>
                    <Button
                      className="mt-4 sm:hidden"
                      onClick={() => {
                        setSidebarOpen(true)
                        setActiveTab('blocks')
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Blocks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {blocks.map(block => (
                      <div
                        key={block.id}
                        className={`relative group ${selectedBlock === block.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                        onClick={() => {
                          setSelectedBlock(block.id)
                          setActiveTab('blocks')
                          setSidebarOpen(true)
                        }}
                      >
                        {renderBlock(block, true)}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={e => {
                              e.stopPropagation()
                              deleteBlock(block.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
