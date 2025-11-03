'use client'

import { useState, useEffect, useRef } from 'react'
import { getSuggestions } from '../services/typesense'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  loading: boolean
}

export default function SearchInput({ value, onChange, onSearch, loading }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const isExternalChange = useRef(false)

  // Sincroniza valor externo apenas quando realmente muda
  useEffect(() => {
    if (value !== localValue && !isExternalChange.current) {
      setLocalValue(value)
    }
    isExternalChange.current = false
  }, [value])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (localValue.length >= 2) {
        try {
          const results = await getSuggestions(localValue)
          setSuggestions(results.slice(0, 5))
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timer)
  }, [localValue])

  const handleInputChange = (newValue: string) => {
    setLocalValue(newValue)
    isExternalChange.current = true
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
          const selected = suggestions[activeSuggestion]
          setLocalValue(selected)
          isExternalChange.current = true
          onChange(selected)
          setShowSuggestions(false)
          setActiveSuggestion(-1)
        } else {
          onSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setActiveSuggestion(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion)
    isExternalChange.current = true
    onChange(suggestion)
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar por nome, cor, tipo... (ex: rosa vermelha, lírio branco)"
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true)
        }}
        onBlur={() => {
          setTimeout(() => {
            setShowSuggestions(false)
            setActiveSuggestion(-1)
          }, 200)
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        disabled={loading}
        autoComplete="off"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                index === activeSuggestion ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }}
              onMouseEnter={() => setActiveSuggestion(index)}
            >
              <span className="text-sm text-gray-500 mr-2">🔍</span>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
