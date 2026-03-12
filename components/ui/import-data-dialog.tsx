"use client"

import { useState, useRef, useCallback } from "react"
import * as XLSX from "xlsx"
import { Upload, Download, X, CheckCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export interface ImportField {
  key: string
  label: string
  required?: boolean
  type?: "text" | "number" | "date"
}

interface ImportDataDialogProps {
  title: string
  description?: string
  schema: ImportField[]
  onImport: (rows: Record<string, string>[]) => void
  trigger?: React.ReactNode
}

type Step = "upload" | "map" | "done"

const NONE = "__none__"

export function ImportDataDialog({ title, description, schema, onImport, trigger }: ImportDataDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("upload")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setStep("upload")
    setHeaders([])
    setRows([])
    setMapping({})
    setError(null)
    setImportedCount(0)
  }

  function handleOpen(v: boolean) {
    if (!v) reset()
    setOpen(v)
  }

  function parseFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" })
        if (!raw || raw.length < 2) {
          setError("Ficheiro vazio ou sem dados suficientes.")
          return
        }
        const hdrs = (raw[0] as string[]).map(String)
        const dataRows = raw.slice(1).filter(r => (r as string[]).some(c => String(c).trim() !== "")) as string[][]

        // Auto-detect column mapping (case-insensitive partial match)
        const autoMap: Record<string, string> = {}
        schema.forEach(field => {
          const match = hdrs.find(h =>
            h.toLowerCase().includes(field.key.toLowerCase()) ||
            h.toLowerCase().includes(field.label.toLowerCase())
          )
          if (match) autoMap[field.key] = match
        })

        setHeaders(hdrs)
        setRows(dataRows)
        setMapping(autoMap)
        setStep("map")
      } catch {
        setError("Erro ao ler o ficheiro. Verifica se é um Excel ou CSV válido.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
    e.target.value = ""
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function confirmImport() {
    const missingRequired = schema.filter(f => f.required && !mapping[f.key])
    if (missingRequired.length > 0) {
      setError(`Campos obrigatórios por mapear: ${missingRequired.map(f => f.label).join(", ")}`)
      return
    }

    const mapped = rows.map(row => {
      const obj: Record<string, string> = {}
      schema.forEach(field => {
        const col = mapping[field.key]
        if (col) {
          const colIdx = headers.indexOf(col)
          obj[field.key] = colIdx >= 0 ? String(row[colIdx] ?? "") : ""
        }
      })
      return obj
    }).filter(r => Object.values(r).some(v => v.trim() !== ""))

    onImport(mapped)
    setImportedCount(mapped.length)
    setStep("done")
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([schema.map(f => f.label)])
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    XLSX.writeFile(wb, `template_${title.toLowerCase().replace(/\s+/g, "_")}.xlsx`)
  }

  const requiredFields = schema.filter(f => f.required)
  const allRequiredMapped = requiredFields.every(f => mapping[f.key])

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl grid-rows-[auto_1fr_auto]" style={{ height: "min(90vh, 640px)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#00D66C]" />
              {title}
            </DialogTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </DialogHeader>

          <div className="overflow-y-auto min-h-0 py-2">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              {(["upload", "map", "done"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className="w-8 h-px bg-border" />}
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full
                    ${step === s ? "bg-[#00D66C]/15 text-[#00D66C]" :
                      (["upload","map","done"].indexOf(step) > i) ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${step === s ? "bg-[#00D66C] text-black" :
                        (["upload","map","done"].indexOf(step) > i) ? "bg-muted text-muted-foreground" : "bg-muted/50 text-muted-foreground/50"}`}>
                      {i + 1}
                    </span>
                    {s === "upload" ? "Upload" : s === "map" ? "Mapeamento" : "Concluído"}
                  </div>
                </div>
              ))}
            </div>

            {/* ── STEP 1: Upload ── */}
            {step === "upload" && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
                    ${dragging ? "border-[#00D66C] bg-[#00D66C]/5" : "border-border hover:border-[#00D66C]/50 hover:bg-muted/30"}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-semibold mb-1">Arrastar ficheiro ou clicar para selecionar</p>
                  <p className="text-sm text-muted-foreground">Suporta Excel (.xlsx) e CSV (.csv)</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Descarregar template</p>
                    <p className="text-xs text-muted-foreground">Excel com as colunas corretas para este módulo</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Campos esperados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schema.map(f => (
                      <span key={f.key} className={`text-xs px-2 py-0.5 rounded-full border
                        ${f.required ? "bg-[#00D66C]/10 border-[#00D66C]/30 text-[#00D66C]" : "bg-muted border-border text-muted-foreground"}`}>
                        {f.label}{f.required ? " *" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Column Mapping ── */}
            {step === "map" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{rows.length} linhas encontradas no ficheiro</span>
                  <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>
                    <X className="h-3 w-3 mr-1" />Alterar ficheiro
                  </Button>
                </div>

                {/* Preview table */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Preview (primeiras 3 linhas)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          {headers.map(h => (
                            <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {headers.map((h, j) => (
                              <td key={h} className="px-3 py-1.5 whitespace-nowrap">{row[j] ?? ""}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Column mapping */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mapear colunas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {schema.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-[#00D66C]">*</span>}
                        </Label>
                        <Select
                          value={mapping[field.key] ?? NONE}
                          onValueChange={v => setMapping(prev => ({ ...prev, [field.key]: v === NONE ? "" : v }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="— ignorar —" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>— ignorar —</SelectItem>
                            {headers.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Done ── */}
            {step === "done" && (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#00D66C]/15 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-[#00D66C]" />
                </div>
                <div>
                  <p className="text-xl font-bold">{importedCount} registos importados</p>
                  <p className="text-sm text-muted-foreground mt-1">Dados guardados com sucesso.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {step === "map" && (
              <Button
                onClick={confirmImport}
                disabled={!allRequiredMapped}
                className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black"
              >
                Importar {rows.length} registos
              </Button>
            )}
            {step === "done" && (
              <Button onClick={() => setOpen(false)} className="bg-[#00D66C] hover:bg-[#00D66C]/90 text-black">
                Fechar
              </Button>
            )}
            {step !== "done" && (
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
