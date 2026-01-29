'use client';

import { useState } from 'react';
import { TenantAggregate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface AdminDashboardProps {
  aggregates: TenantAggregate[];
}

export function AdminDashboard({ aggregates }: AdminDashboardProps) {
  const [selectedTenant, setSelectedTenant] = useState<TenantAggregate | null>(null);

  // Calculate totals
  const totals = aggregates.reduce(
    (acc, t) => ({
      submissions: acc.submissions + Number(t.total_submissions),
      last7days: acc.last7days + Number(t.submissions_last_7_days),
      last30days: acc.last30days + Number(t.submissions_last_30_days),
      gradeA: acc.gradeA + Number(t.grade_a_count),
      gradeB: acc.gradeB + Number(t.grade_b_count),
      gradeC: acc.gradeC + Number(t.grade_c_count),
      highUrgency: acc.highUrgency + Number(t.high_urgency_count),
    }),
    { submissions: 0, last7days: 0, last30days: 0, gradeA: 0, gradeB: 0, gradeC: 0, highUrgency: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900">{totals.submissions}</div>
            <div className="text-sm text-gray-500">Total diagnósticos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">{totals.last7days}</div>
            <div className="text-sm text-gray-500">Últimos 7 días</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">{totals.last30days}</div>
            <div className="text-sm text-gray-500">Últimos 30 días</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-600">{totals.highUrgency}</div>
            <div className="text-sm text-gray-500">Urgencia alta</div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants ({aggregates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Tenant</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Total</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">7 días</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">30 días</th>
                  <th className="pb-3 font-medium text-gray-500 text-center">Distribución</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Alta urgencia</th>
                  <th className="pb-3 font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {aggregates.map((tenant) => {
                  const total = Number(tenant.total_submissions) || 1;
                  const aPercent = Math.round((Number(tenant.grade_a_count) / total) * 100);
                  const bPercent = Math.round((Number(tenant.grade_b_count) / total) * 100);
                  const cPercent = Math.round((Number(tenant.grade_c_count) / total) * 100);

                  return (
                    <tr
                      key={tenant.tenant_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tenant.brand_color }}
                          />
                          <span className="font-medium text-gray-900">{tenant.name}</span>
                          <span className="text-gray-400">/{tenant.slug}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-medium">{tenant.total_submissions}</td>
                      <td className="py-4 text-right">{tenant.submissions_last_7_days}</td>
                      <td className="py-4 text-right">{tenant.submissions_last_30_days}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 justify-center">
                          {Number(tenant.total_submissions) > 0 ? (
                            <>
                              <div
                                className="h-6 bg-green-500 rounded-l"
                                style={{ width: `${aPercent}px`, minWidth: aPercent > 0 ? '4px' : '0' }}
                                title={`A: ${tenant.grade_a_count} (${aPercent}%)`}
                              />
                              <div
                                className="h-6 bg-amber-500"
                                style={{ width: `${bPercent}px`, minWidth: bPercent > 0 ? '4px' : '0' }}
                                title={`B: ${tenant.grade_b_count} (${bPercent}%)`}
                              />
                              <div
                                className="h-6 bg-red-500 rounded-r"
                                style={{ width: `${cPercent}px`, minWidth: cPercent > 0 ? '4px' : '0' }}
                                title={`C: ${tenant.grade_c_count} (${cPercent}%)`}
                              />
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        {Number(tenant.high_urgency_count) > 0 && (
                          <span className="text-red-600 font-medium">
                            {tenant.high_urgency_count}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <Badge variant={tenant.is_active ? 'success' : 'default'}>
                          {tenant.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected tenant detail */}
      {selectedTenant && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedTenant.brand_color }}
                />
                {selectedTenant.name}
              </CardTitle>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedTenant.total_submissions}
                </div>
                <div className="text-sm text-gray-500">Total diagnósticos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedTenant.grade_a_count}
                </div>
                <div className="text-sm text-gray-500">Nota A</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {selectedTenant.grade_b_count}
                </div>
                <div className="text-sm text-gray-500">Nota B</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {selectedTenant.grade_c_count}
                </div>
                <div className="text-sm text-gray-500">Nota C</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6 pt-6 border-t">
              <div>
                <div className="text-lg font-semibold text-red-600">
                  {selectedTenant.high_urgency_count}
                </div>
                <div className="text-sm text-gray-500">Urgencia alta</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-600">
                  {selectedTenant.medium_urgency_count}
                </div>
                <div className="text-sm text-gray-500">Urgencia media</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {selectedTenant.low_urgency_count}
                </div>
                <div className="text-sm text-gray-500">Urgencia baja</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
              <p>Slug: /{selectedTenant.slug}</p>
              <p>Creado: {formatDate(selectedTenant.tenant_created_at)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>Nota de seguridad:</strong> Como administrador, solo tienes acceso a métricas agregadas.
        No puedes ver los datos individuales de los diagnósticos ni la información de contacto de los usuarios.
      </div>
    </div>
  );
}
