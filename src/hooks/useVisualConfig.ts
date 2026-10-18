import { useCallback, useMemo, useReducer } from 'react';
import { isMap, parse as parseYaml, parseDocument } from 'yaml';
import type {
  DisableImageGenerationMode,
  PluginStoreAuthApplyTo,
  PluginStoreAuthRule,
  PluginStoreAuthType,
  PayloadFilterRule,
  PayloadHeaderEntry,
  PayloadParamEntry,
  PayloadParamValueType,
  PayloadRule,
  RoutingStrategy,
  VisualConfigValues,
  VisualConfigValidationErrors,
  PayloadParamValidationErrorCode,
  LLMDiagnosticsConfig,
} from '@/types/visualConfig';
import { DEFAULT_VISUAL_VALUES } from '@/types/visualConfig';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function extractApiKeyValue(raw: unknown): string | null {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed ? trimmed : null;
  }

  const record = asRecord(raw);
  if (!record) return null;

  const candidates = [record['api-key'], record.apiKey, record.key, record.Key];
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) return trimmed;
    }
  }

  return null;
}

function parseApiKeysText(raw: unknown): string {
  if (!Array.isArray(raw)) return '';

  const keys: string[] = [];
  for (const item of raw) {
    const key = extractApiKeyValue(item);
    if (key) keys.push(key);
  }
  return keys.join('\n');
}

function resolveApiKeysText(parsed: Record<string, unknown>): string {
  if (Object.prototype.hasOwnProperty.call(parsed, 'api-keys')) {
    return parseApiKeysText(parsed['api-keys']);
  }

  const auth = asRecord(parsed.auth);
  const providers = asRecord(auth?.providers);
  const configApiKeyProvider = asRecord(providers?.['config-api-key']);
  if (!configApiKeyProvider) return '';

  if (Object.prototype.hasOwnProperty.call(configApiKeyProvider, 'api-key-entries')) {
    return parseApiKeysText(configApiKeyProvider['api-key-entries']);
  }

  return parseApiKeysText(configApiKeyProvider['api-keys']);
}

type YamlDocument = ReturnType<typeof parseDocument>;
type YamlPath = string[];

function docHas(doc: YamlDocument, path: YamlPath): boolean {
  return doc.hasIn(path);
}

function ensureMapInDoc(doc: YamlDocument, path: YamlPath): void {
  const existing = doc.getIn(path, true);
  if (isMap(existing)) return;
  // Use a YAML node here; plain objects are not treated as collections by subsequent `setIn`.
  doc.setIn(path, doc.createNode({}));
}

function deleteIfMapEmpty(doc: YamlDocument, path: YamlPath): void {
  const value = doc.getIn(path, true);
  if (!isMap(value)) return;
  if (value.items.length === 0) doc.deleteIn(path);
}

function setBooleanInDoc(doc: YamlDocument, path: YamlPath, value: boolean): void {
  if (value) {
    doc.setIn(path, true);
    return;
  }
  if (docHas(doc, path)) doc.setIn(path, false);
}

function setStringInDoc(doc: YamlDocument, path: YamlPath, value: unknown): void {
  const safe = typeof value === 'string' ? value : '';
  const trimmed = safe.trim();
  if (trimmed !== '') {
    doc.setIn(path, safe);
    return;
  }
  // Preserve existing empty-string keys to avoid dropping template blocks/comments.
  // Only keep the key when it already exists in the YAML.
  if (docHas(doc, path)) {
    doc.setIn(path, '');
  }
}

function setStringListInDoc(doc: YamlDocument, path: YamlPath, values: string[]): void {
  const nextValues = values.map((value) => value.trim()).filter(Boolean);
  if (nextValues.length > 0) {
    doc.setIn(path, nextValues);
    return;
  }
  if (docHas(doc, path)) doc.deleteIn(path);
}

function setIntFromStringInDoc(doc: YamlDocument, path: YamlPath, value: unknown): void {
  const safe = typeof value === 'string' ? value : '';
  const trimmed = safe.trim();
  if (trimmed === '') {
    if (docHas(doc, path)) doc.deleteIn(path);
    return;
  }

  if (!/^-?\d+$/.test(trimmed)) {
    return;
  }

  const parsed = Number(trimmed);
  if (Number.isFinite(parsed)) {
    doc.setIn(path, parsed);
    return;
  }
}

function setDisableImageGenerationInDoc(
  doc: YamlDocument,
  path: YamlPath,
  value: DisableImageGenerationMode
): void {
  if (value === 'chat' || value === 'passthrough') {
    doc.setIn(path, value);
    return;
  }

  if (value === 'true') {
    doc.setIn(path, true);
    return;
  }

  if (docHas(doc, path)) doc.setIn(path, false);
}

const PAYLOAD_DIRTY_FIELDS = [
  'payloadDefaultRules',
  'payloadDefaultRawRules',
  'payloadOverrideRules',
  'payloadOverrideRawRules',
  'payloadFilterRules',
] as const;

function hasPayloadDirtyFields(dirtyFields: Set<string>): boolean {
  return PAYLOAD_DIRTY_FIELDS.some((field) => dirtyFields.has(field));
}

function getNonNegativeIntegerError(value: string | number): 'non_negative_integer' | undefined {
  const str = String(value).trim();
  if (!str) return undefined;
  if (!/^-?\d+$/.test(str)) return 'non_negative_integer';
  return Number(str) >= 0 ? undefined : 'non_negative_integer';
}

function getPortError(value: string): 'port_range' | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return 'port_range';
  const parsed = Number(trimmed);
  return parsed >= 1 && parsed <= 65535 ? undefined : 'port_range';
}

function getRedisRetentionError(value: string): 'integer_range_1_3600' | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return 'integer_range_1_3600';
  const parsed = Number(trimmed);
  return parsed >= 1 && parsed <= 3600 ? undefined : 'integer_range_1_3600';
}

export function getVisualConfigValidationErrors(
  values: VisualConfigValues
): VisualConfigValidationErrors {
  return {
    port: getPortError(values.port),
    errorLogsMaxFiles: getNonNegativeIntegerError(values.errorLogsMaxFiles),
    logsMaxTotalSizeMb: getNonNegativeIntegerError(values.logsMaxTotalSizeMb),
    redisUsageQueueRetentionSeconds: getRedisRetentionError(values.redisUsageQueueRetentionSeconds),
    requestRetry: getNonNegativeIntegerError(values.requestRetry),
    maxRetryCredentials: getNonNegativeIntegerError(values.maxRetryCredentials),
    maxRetryInterval: getNonNegativeIntegerError(values.maxRetryInterval),
    authAutoRefreshWorkers: getNonNegativeIntegerError(values.authAutoRefreshWorkers),
    'streaming.keepaliveSeconds': getNonNegativeIntegerError(values.streaming.keepaliveSeconds),
    'streaming.bootstrapRetries': getNonNegativeIntegerError(values.streaming.bootstrapRetries),
    'streaming.nonstreamKeepaliveInterval': getNonNegativeIntegerError(
      values.streaming.nonstreamKeepaliveInterval
    ),
  };
}

export function getPayloadParamValidationError(
  param: PayloadParamEntry
): PayloadParamValidationErrorCode | undefined {
  const trimmedValue = param.value.trim();

  switch (param.valueType) {
    case 'number': {
      if (!trimmedValue) return 'payload_invalid_number';
      const parsed = Number(trimmedValue);
      return Number.isFinite(parsed) ? undefined : 'payload_invalid_number';
    }
    case 'boolean': {
      const normalized = trimmedValue.toLowerCase();
      return normalized === 'true' || normalized === 'false'
        ? undefined
        : 'payload_invalid_boolean';
    }
    case 'json': {
      if (!trimmedValue) return 'payload_invalid_json';
      try {
        JSON.parse(param.value);
        return undefined;
      } catch {
        return 'payload_invalid_json';
      }
    }
    default:
      return undefined;
  }
}

function hasPayloadParamValidationErrors(rules: PayloadRule[]): boolean {
  return rules.some(
    (rule) =>
      rule.params.some((param) => Boolean(getPayloadParamValidationError(param))) ||
      rule.models.some(
        (model) =>
          (model.match ?? []).some((param) => Boolean(getPayloadParamValidationError(param))) ||
          (model.notMatch ?? []).some((param) => Boolean(getPayloadParamValidationError(param)))
      )
  );
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function arePayloadModelEntriesEqual(
  left: PayloadRule['models'],
  right: PayloadRule['models']
): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (!a || !b) return false;
    if (
      a.id !== b.id ||
      a.name !== b.name ||
      a.protocol !== b.protocol ||
      a.fromProtocol !== b.fromProtocol
    ) {
      return false;
    }
    if (!arePayloadHeaderEntriesEqual(a.headers, b.headers)) return false;
    if (!arePayloadParamEntriesEqual(a.match ?? [], b.match ?? [])) return false;
    if (!arePayloadParamEntriesEqual(a.notMatch ?? [], b.notMatch ?? [])) return false;
    if (!areStringArraysEqual(a.exist, b.exist)) return false;
    if (!areStringArraysEqual(a.notExist, b.notExist)) return false;
  }
  return true;
}

function arePayloadParamEntriesEqual(
  left: PayloadRule['params'],
  right: PayloadRule['params']
): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (!a || !b) return false;
    if (a.id !== b.id || a.path !== b.path || a.valueType !== b.valueType || a.value !== b.value) {
      return false;
    }
  }
  return true;
}

function arePayloadHeaderEntriesEqual(
  left: PayloadHeaderEntry[] | undefined,
  right: PayloadHeaderEntry[] | undefined
): boolean {
  const leftEntries = left ?? [];
  const rightEntries = right ?? [];
  if (leftEntries === rightEntries) return true;
  if (leftEntries.length !== rightEntries.length) return false;
  for (let i = 0; i < leftEntries.length; i += 1) {
    const a = leftEntries[i];
    const b = rightEntries[i];
    if (!a || !b) return false;
    if (a.id !== b.id || a.name !== b.name || a.value !== b.value) return false;
  }
  return true;
}

function areStringArraysEqual(left: string[] | undefined, right: string[] | undefined): boolean {
  const leftItems = left ?? [];
  const rightItems = right ?? [];
  if (leftItems === rightItems) return true;
  if (leftItems.length !== rightItems.length) return false;
  for (let i = 0; i < leftItems.length; i += 1) {
    if (leftItems[i] !== rightItems[i]) return false;
  }
  return true;
}

function arePluginStoreAuthRulesEqual(
  left: PluginStoreAuthRule[] | undefined,
  right: PluginStoreAuthRule[] | undefined
): boolean {
  const leftItems = left ?? [];
  const rightItems = right ?? [];
  if (leftItems === rightItems) return true;
  if (leftItems.length !== rightItems.length) return false;
  for (let i = 0; i < leftItems.length; i += 1) {
    const a = leftItems[i];
    const b = rightItems[i];
    if (!a || !b) return false;
    if (
      a.match !== b.match ||
      a.type !== b.type ||
      a.tokenEnv !== b.tokenEnv ||
      a.usernameEnv !== b.usernameEnv ||
      a.passwordEnv !== b.passwordEnv ||
      a.headerName !== b.headerName ||
      a.headerValueEnv !== b.headerValueEnv ||
      a.allowInsecure !== b.allowInsecure
    ) {
      return false;
    }
    if (!areStringArraysEqual(a.applyTo, b.applyTo)) return false;
  }
  return true;
}

function arePayloadRulesEqual(left: PayloadRule[], right: PayloadRule[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (!a || !b) return false;
    if (a.id !== b.id) return false;
    if (!arePayloadModelEntriesEqual(a.models, b.models)) return false;
    if (!arePayloadParamEntriesEqual(a.params, b.params)) return false;
  }
  return true;
}

function arePayloadFilterRulesEqual(
  left: PayloadFilterRule[],
  right: PayloadFilterRule[]
): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (!a || !b) return false;
    if (a.id !== b.id) return false;
    if (!arePayloadModelEntriesEqual(a.models, b.models)) return false;
    if (a.params.length !== b.params.length) return false;
    for (let j = 0; j < a.params.length; j += 1) {
      if (a.params[j] !== b.params[j]) return false;
    }
  }
  return true;
}

function parsePayloadParamValue(raw: unknown): { valueType: PayloadParamValueType; value: string } {
  if (typeof raw === 'number') {
    return { valueType: 'number', value: String(raw) };
  }

  if (typeof raw === 'boolean') {
    return { valueType: 'boolean', value: String(raw) };
  }

  if (raw === null || typeof raw === 'object') {
    try {
      const json = JSON.stringify(raw, null, 2);
      return { valueType: 'json', value: json ?? 'null' };
    } catch {
      return { valueType: 'json', value: String(raw) };
    }
  }

  return { valueType: 'string', value: String(raw ?? '') };
}

function parseRawPayloadParamValue(raw: unknown): string {
  if (typeof raw === 'string') return raw;

  try {
    const json = JSON.stringify(raw, null, 2);
    return json ?? '';
  } catch {
    return String(raw ?? '');
  }
}

function parsePayloadProtocol(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  return raw.trim() ? raw : undefined;
}

export function parseRoutingStrategy(raw: unknown): RoutingStrategy {
  const normalized = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (['weighted-round-robin', 'weightedroundrobin', 'wrr'].includes(normalized)) {
    return 'weighted-round-robin';
  }
  if (['fill-first', 'fillfirst', 'ff'].includes(normalized)) return 'fill-first';
  return 'round-robin';
}

export function parseDisableImageGenerationMode(raw: unknown): DisableImageGenerationMode {
  if (raw === true) return 'true';
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'true') return 'true';
    if (normalized === 'chat') return 'chat';
    if (normalized === 'passthrough') return 'passthrough';
  }
  return 'false';
}

function parsePayloadHeaders(raw: unknown, idPrefix: string): PayloadHeaderEntry[] {
  const record = asRecord(raw);
  if (!record) return [];

  return Object.entries(record).map(([name, value], index) => ({
    id: `${idPrefix}-header-${index}`,
    name,
    value: String(value ?? ''),
  }));
}

function parsePayloadConditions(raw: unknown, idPrefix: string): PayloadParamEntry[] {
  if (!Array.isArray(raw)) return [];

  const entries: PayloadParamEntry[] = [];
  raw.forEach((item, itemIndex) => {
    const record = asRecord(item);
    if (!record) {
      if (typeof item === 'string') {
        entries.push({
          id: `${idPrefix}-condition-${itemIndex}-0`,
          path: item,
          valueType: 'string',
          value: '',
        });
      }
      return;
    }

    Object.entries(record).forEach(([path, value], valueIndex) => {
      const parsedValue = parsePayloadParamValue(value);
      entries.push({
        id: `${idPrefix}-condition-${itemIndex}-${valueIndex}`,
        path,
        valueType: parsedValue.valueType,
        value: parsedValue.value,
      });
    });
  });

  return entries;
}

function parseStringList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
}

const PLUGIN_STORE_AUTH_TYPES: PluginStoreAuthType[] = [
  'none',
  'bearer',
  'basic',
  'header',
  'github-token',
];
const PLUGIN_STORE_AUTH_APPLY_TO: PluginStoreAuthApplyTo[] = ['registry', 'metadata', 'artifact'];

function parsePluginStoreAuthType(raw: unknown): PluginStoreAuthType {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  return PLUGIN_STORE_AUTH_TYPES.includes(value as PluginStoreAuthType)
    ? (value as PluginStoreAuthType)
    : 'none';
}

function parsePluginStoreAuthApplyTo(raw: unknown): PluginStoreAuthApplyTo[] {
  return parseStringList(raw)
    .map((item) => item.toLowerCase())
    .filter((item): item is PluginStoreAuthApplyTo =>
      PLUGIN_STORE_AUTH_APPLY_TO.includes(item as PluginStoreAuthApplyTo)
    );
}

function parsePluginStoreAuthRules(raw: unknown): PluginStoreAuthRule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index): PluginStoreAuthRule | null => {
      const record = asRecord(item);
      if (!record) return null;
      const match = typeof record.match === 'string' ? record.match : '';
      const rule: PluginStoreAuthRule = {
        id: `plugin-store-auth-${index}`,
        match,
        applyTo: parsePluginStoreAuthApplyTo(record['apply-to'] ?? record.apply_to),
        type: parsePluginStoreAuthType(record.type),
        tokenEnv: typeof record['token-env'] === 'string' ? record['token-env'] : '',
        usernameEnv: typeof record['username-env'] === 'string' ? record['username-env'] : '',
        passwordEnv: typeof record['password-env'] === 'string' ? record['password-env'] : '',
        headerName: typeof record['header-name'] === 'string' ? record['header-name'] : '',
        headerValueEnv:
          typeof record['header-value-env'] === 'string' ? record['header-value-env'] : '',
        allowInsecure: Boolean(record['allow-insecure'] ?? record.allow_insecure),
      };
      return rule.match.trim() ||
        rule.type !== 'none' ||
        rule.applyTo.length > 0 ||
        rule.tokenEnv.trim() ||
        rule.usernameEnv.trim() ||
        rule.passwordEnv.trim() ||
        rule.headerName.trim() ||
        rule.headerValueEnv.trim() ||
        rule.allowInsecure
        ? rule
        : null;
    })
    .filter((rule): rule is PluginStoreAuthRule => Boolean(rule));
}

function deleteLegacyApiKeysProvider(doc: YamlDocument): void {
  if (docHas(doc, ['auth', 'providers', 'config-api-key', 'api-key-entries'])) {
    doc.deleteIn(['auth', 'providers', 'config-api-key', 'api-key-entries']);
  }
  if (docHas(doc, ['auth', 'providers', 'config-api-key', 'api-keys'])) {
    doc.deleteIn(['auth', 'providers', 'config-api-key', 'api-keys']);
  }
  deleteIfMapEmpty(doc, ['auth', 'providers', 'config-api-key']);
  deleteIfMapEmpty(doc, ['auth', 'providers']);
  deleteIfMapEmpty(doc, ['auth']);
}

function parsePayloadModelEntries(raw: unknown, idPrefix: string): PayloadRule['models'] {
  if (!Array.isArray(raw)) return [];

  return raw.map((model, modelIndex) => {
    const modelRecord = asRecord(model);
    const nameRaw =
      typeof model === 'string' ? model : (modelRecord?.name ?? modelRecord?.id ?? '');
    const name = typeof nameRaw === 'string' ? nameRaw : String(nameRaw ?? '');
    const modelId = `${idPrefix}-${modelIndex}`;

    return {
      id: modelId,
      name,
      protocol: parsePayloadProtocol(modelRecord?.protocol),
      fromProtocol: parsePayloadProtocol(modelRecord?.['from-protocol']),
      headers: parsePayloadHeaders(modelRecord?.headers, modelId),
      match: parsePayloadConditions(modelRecord?.match, `${modelId}-match`),
      notMatch: parsePayloadConditions(modelRecord?.['not-match'], `${modelId}-not-match`),
      exist: parseStringList(modelRecord?.exist),
      notExist: parseStringList(modelRecord?.['not-exist']),
    };
  });
}

function parsePayloadRules(rules: unknown): PayloadRule[] {
  if (!Array.isArray(rules)) return [];

  return rules.map((rule, index) => {
    const record = asRecord(rule) ?? {};

    const models = parsePayloadModelEntries(record.models, `model-${index}`);

    const paramsRecord = asRecord(record.params);
    const params = paramsRecord
      ? Object.entries(paramsRecord).map(([path, value], pIndex) => {
          const parsedValue = parsePayloadParamValue(value);
          return {
            id: `param-${index}-${pIndex}`,
            path,
            valueType: parsedValue.valueType,
            value: parsedValue.value,
          };
        })
      : [];

    return { id: `payload-rule-${index}`, models, params };
  });
}

function parsePayloadFilterRules(rules: unknown): PayloadFilterRule[] {
  if (!Array.isArray(rules)) return [];

  return rules.map((rule, index) => {
    const record = asRecord(rule) ?? {};

    const models = parsePayloadModelEntries(record.models, `filter-model-${index}`);

    const paramsRaw = record.params;
    const params = Array.isArray(paramsRaw) ? paramsRaw.map(String) : [];

    return { id: `payload-filter-rule-${index}`, models, params };
  });
}

function parseRawPayloadRules(rules: unknown): PayloadRule[] {
  if (!Array.isArray(rules)) return [];

  return rules.map((rule, index) => {
    const record = asRecord(rule) ?? {};

    const models = parsePayloadModelEntries(record.models, `raw-model-${index}`);

    const paramsRecord = asRecord(record.params);
    const params = paramsRecord
      ? Object.entries(paramsRecord).map(([path, value], pIndex) => ({
          id: `raw-param-${index}-${pIndex}`,
          path,
          valueType: 'json' as const,
          value: parseRawPayloadParamValue(value),
        }))
      : [];

    return { id: `payload-raw-rule-${index}`, models, params };
  });
}

function serializePayloadParamEntryValue(param: PayloadParamEntry): unknown {
  if (param.valueType === 'number') {
    const num = Number(param.value);
    return Number.isFinite(num) ? num : param.value;
  }
  if (param.valueType === 'boolean') {
    return param.value === 'true';
  }
  if (param.valueType === 'json') {
    try {
      return JSON.parse(param.value);
    } catch {
      return param.value;
    }
  }
  return param.value;
}

function serializePayloadHeadersForYaml(headers?: PayloadHeaderEntry[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const header of headers ?? []) {
    const name = header.name.trim();
    if (!name) continue;
    result[name] = header.value;
  }
  return result;
}

function serializePayloadConditionsForYaml(
  conditions?: PayloadParamEntry[]
): Array<Record<string, unknown>> {
  const result: Array<Record<string, unknown>> = [];
  for (const condition of conditions ?? []) {
    const path = condition.path.trim();
    if (!path) continue;
    result.push({ [path]: serializePayloadParamEntryValue(condition) });
  }
  return result;
}

function serializeStringListForYaml(items?: string[]): string[] {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
}

function serializePluginStoreAuthForYaml(
  rules: PluginStoreAuthRule[]
): Array<Record<string, unknown>> {
  return rules
    .map((rule) => {
      const match = rule.match.trim();
      if (!match) return null;
      const item: Record<string, unknown> = {
        match,
        type: rule.type,
      };
      const applyTo = serializeStringListForYaml(rule.applyTo);
      if (applyTo.length > 0) item['apply-to'] = applyTo;
      if (rule.tokenEnv.trim()) item['token-env'] = rule.tokenEnv.trim();
      if (rule.usernameEnv.trim()) item['username-env'] = rule.usernameEnv.trim();
      if (rule.passwordEnv.trim()) item['password-env'] = rule.passwordEnv.trim();
      if (rule.headerName.trim()) item['header-name'] = rule.headerName.trim();
      if (rule.headerValueEnv.trim()) item['header-value-env'] = rule.headerValueEnv.trim();
      if (rule.allowInsecure) item['allow-insecure'] = true;
      return item;
    })
    .filter((rule): rule is Record<string, unknown> => Boolean(rule));
}

function serializePayloadModelsForYaml(
  models: PayloadRule['models']
): Array<Record<string, unknown>> {
  return (models || [])
    .filter((m) => m.name?.trim())
    .map((m) => {
      const obj: Record<string, unknown> = { name: m.name.trim() };
      if (m.protocol) obj.protocol = m.protocol;
      if (m.fromProtocol) obj['from-protocol'] = m.fromProtocol;

      const headers = serializePayloadHeadersForYaml(m.headers);
      if (Object.keys(headers).length) obj.headers = headers;

      const match = serializePayloadConditionsForYaml(m.match);
      if (match.length) obj.match = match;

      const notMatch = serializePayloadConditionsForYaml(m.notMatch);
      if (notMatch.length) obj['not-match'] = notMatch;

      const exist = serializeStringListForYaml(m.exist);
      if (exist.length) obj.exist = exist;

      const notExist = serializeStringListForYaml(m.notExist);
      if (notExist.length) obj['not-exist'] = notExist;

      return obj;
    });
}

function serializePayloadRulesForYaml(rules: PayloadRule[]): Array<Record<string, unknown>> {
  return rules
    .map((rule) => {
      const models = serializePayloadModelsForYaml(rule.models);

      const params: Record<string, unknown> = {};
      for (const param of rule.params || []) {
        if (!param.path?.trim()) continue;
        params[param.path.trim()] = serializePayloadParamEntryValue(param);
      }

      return { models, params };
    })
    .filter((rule) => rule.models.length > 0);
}

function serializePayloadFilterRulesForYaml(
  rules: PayloadFilterRule[]
): Array<Record<string, unknown>> {
  return rules
    .map((rule) => {
      const models = serializePayloadModelsForYaml(rule.models);

      const params = (Array.isArray(rule.params) ? rule.params : [])
        .map((path) => String(path).trim())
        .filter(Boolean);

      return { models, params };
    })
    .filter((rule) => rule.models.length > 0);
}

function serializeRawPayloadRulesForYaml(rules: PayloadRule[]): Array<Record<string, unknown>> {
  return rules
    .map((rule) => {
      const models = serializePayloadModelsForYaml(rule.models);

      const params: Record<string, unknown> = {};
      for (const param of rule.params || []) {
        if (!param.path?.trim()) continue;
        params[param.path.trim()] = param.value;
      }

      return { models, params };
    })
    .filter((rule) => rule.models.length > 0);
}

type VisualConfigState = {
  visualValues: VisualConfigValues;
  baselineValues: VisualConfigValues;
  dirtyFields: Set<string>;
  visualParseError: string | null;
};

type VisualConfigAction =
  | {
      type: 'load_success';
      values: VisualConfigValues;
    }
  | {
      type: 'load_error';
      error: string;
    }
  | {
      type: 'set_values';
      values: Partial<VisualConfigValues>;
    };

function createInitialVisualConfigState(): VisualConfigState {
  const initialValues = deepClone(DEFAULT_VISUAL_VALUES);
  return {
    visualValues: initialValues,
    baselineValues: deepClone(initialValues),
    dirtyFields: new Set(),
    visualParseError: null,
  };
}

function mergeVisualConfigValues(
  currentValues: VisualConfigValues,
  patch: Partial<VisualConfigValues>
): VisualConfigValues {
  const nextValues: VisualConfigValues = { ...currentValues, ...patch } as VisualConfigValues;
  if (patch.streaming) {
    nextValues.streaming = { ...currentValues.streaming, ...patch.streaming };
  }
  return nextValues;
}

function getNextDirtyFields(
  currentDirtyFields: Set<string>,
  patch: Partial<VisualConfigValues>,
  nextValues: VisualConfigValues,
  baselineValues: VisualConfigValues
): Set<string> {
  const nextDirtyFields = new Set(currentDirtyFields);
  const updateDirty = (key: string, isEqual: boolean) => {
    if (isEqual) {
      nextDirtyFields.delete(key);
    } else {
      nextDirtyFields.add(key);
    }
  };
  const updateScalarDirty = (key: keyof VisualConfigValues) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      updateDirty(key, nextValues[key] === baselineValues[key]);
    }
  };

  (
    [
      'rmDisableAutoUpdatePanel',
      'errorLogsMaxFiles',
      'usageStatisticsEnabled',
      'redisUsageQueueRetentionSeconds',
      'pluginsEnabled',
      'passthroughHeaders',
      'disableCooling',
      'disableImageGeneration',
      'gptImage2BaseModel',
      'authAutoRefreshWorkers',
      'antigravitySignatureCacheEnabled',
      'antigravitySignatureBypassStrict',
      'claudeHeaderUserAgent',
      'claudeHeaderPackageVersion',
      'claudeHeaderRuntimeVersion',
      'claudeHeaderOs',
      'claudeHeaderArch',
      'claudeHeaderTimeout',
      'claudeHeaderStabilizeDeviceProfile',
      'codexHeaderUserAgent',
      'codexHeaderBetaFeatures',
      'host',
      'port',
      'tlsEnable',
      'tlsCert',
      'tlsKey',
      'rmAllowRemote',
      'rmSecretKey',
      'rmDisableControlPanel',
      'rmPanelRepo',
      'authDir',
      'apiKeysText',
      'debug',
      'commercialMode',
      'loggingToFile',
      'logsMaxTotalSizeMb',
      'proxyUrl',
      'forceModelPrefix',
      'requestRetry',
      'maxRetryCredentials',
      'maxRetryInterval',
      'wsAuth',
      'quotaSwitchProject',
      'quotaSwitchPreviewModel',
      'quotaAntigravityCredits',
      'routingStrategy',
      'routingSessionAffinity',
      'routingSessionAffinityTTL',
    ] as Array<keyof VisualConfigValues>
  ).forEach(updateScalarDirty);

  if (Object.prototype.hasOwnProperty.call(patch, 'pluginStoreSources')) {
    updateDirty(
      'pluginStoreSources',
      areStringArraysEqual(nextValues.pluginStoreSources, baselineValues.pluginStoreSources)
    );
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'pluginStoreAuth')) {
    updateDirty(
      'pluginStoreAuth',
      arePluginStoreAuthRulesEqual(nextValues.pluginStoreAuth, baselineValues.pluginStoreAuth)
    );
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'payloadDefaultRules')) {
    updateDirty(
      'payloadDefaultRules',
      arePayloadRulesEqual(nextValues.payloadDefaultRules, baselineValues.payloadDefaultRules)
    );
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'payloadDefaultRawRules')) {
    updateDirty(
      'payloadDefaultRawRules',
      arePayloadRulesEqual(nextValues.payloadDefaultRawRules, baselineValues.payloadDefaultRawRules)
    );
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'payloadOverrideRules')) {
    updateDirty(
      'payloadOverrideRules',
      arePayloadRulesEqual(nextValues.payloadOverrideRules, baselineValues.payloadOverrideRules)
    );
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'payloadOverrideRawRules')) {
    updateDirty(
      'payloadOverrideRawRules',
      arePayloadRulesEqual(
        nextValues.payloadOverrideRawRules,
        baselineValues.payloadOverrideRawRules
      )
    );
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'payloadFilterRules')) {
    updateDirty(
      'payloadFilterRules',
      arePayloadFilterRulesEqual(nextValues.payloadFilterRules, baselineValues.payloadFilterRules)
    );
  }
  if (patch.streaming) {
    const streamingPatch = patch.streaming;
    if (Object.prototype.hasOwnProperty.call(streamingPatch, 'keepaliveSeconds')) {
      updateDirty(
        'streaming.keepaliveSeconds',
        nextValues.streaming.keepaliveSeconds === baselineValues.streaming.keepaliveSeconds
      );
    }
    if (Object.prototype.hasOwnProperty.call(streamingPatch, 'bootstrapRetries')) {
      updateDirty(
        'streaming.bootstrapRetries',
        nextValues.streaming.bootstrapRetries === baselineValues.streaming.bootstrapRetries
      );
    }
    if (Object.prototype.hasOwnProperty.call(streamingPatch, 'nonstreamKeepaliveInterval')) {
      updateDirty(
        'streaming.nonstreamKeepaliveInterval',
        nextValues.streaming.nonstreamKeepaliveInterval ===
          baselineValues.streaming.nonstreamKeepaliveInterval
      );
    }
  }

  return nextDirtyFields;
}

function visualConfigReducer(
  state: VisualConfigState,
  action: VisualConfigAction
): VisualConfigState {
  switch (action.type) {
    case 'load_success':
      return {
        visualValues: action.values,
        baselineValues: deepClone(action.values),
        dirtyFields: new Set(),
        visualParseError: null,
      };
    case 'load_error':
      return {
        ...state,
        visualParseError: action.error,
      };
    case 'set_values': {
      const nextValues = mergeVisualConfigValues(state.visualValues, action.values);
      const nextDirtyFields = getNextDirtyFields(
        state.dirtyFields,
        action.values,
        nextValues,
        state.baselineValues
      );

      return {
        ...state,
        visualValues: nextValues,
        dirtyFields: nextDirtyFields,
      };
    }
    default:
      return state;
  }
}

export function useVisualConfig() {
  const [state, dispatch] = useReducer(
    visualConfigReducer,
    undefined,
    createInitialVisualConfigState
  );
  const { visualValues, visualParseError, dirtyFields } = state;
  const visualDirty = dirtyFields.size > 0;
  const visualValidationErrors = useMemo(
    () => getVisualConfigValidationErrors(visualValues),
    [visualValues]
  );
  const visualHasPayloadValidationErrors = useMemo(
    () =>
      hasPayloadParamValidationErrors(visualValues.payloadDefaultRules) ||
      hasPayloadParamValidationErrors(visualValues.payloadDefaultRawRules) ||
      hasPayloadParamValidationErrors(visualValues.payloadOverrideRules) ||
      hasPayloadParamValidationErrors(visualValues.payloadOverrideRawRules),
    [
      visualValues.payloadDefaultRules,
      visualValues.payloadDefaultRawRules,
      visualValues.payloadOverrideRules,
      visualValues.payloadOverrideRawRules,
    ]
  );

  const loadVisualValuesFromYaml = useCallback((yamlContent: string) => {
    try {
      const document = parseDocument(yamlContent);
      if (document.errors.length > 0) {
        throw new Error(document.errors[0]?.message ?? 'Invalid YAML');
      }

      const parsedRaw: unknown = parseYaml(yamlContent) || {};
      const parsed = asRecord(parsedRaw) ?? {};
      const tls = asRecord(parsed.tls);
      const remoteManagement = asRecord(parsed['remote-management']);
      const quotaExceeded = asRecord(parsed['quota-exceeded']);
      const routing = asRecord(parsed.routing);
      const payload = asRecord(parsed.payload);
      const streaming = asRecord(parsed.streaming);
      const plugins = asRecord(parsed.plugins);
      const claudeHeaderDefaults = asRecord(parsed['claude-header-defaults']);
      const codexHeaderDefaults = asRecord(parsed['codex-header-defaults']);
      const rtk = asRecord(parsed.rtk);
      const caveman = asRecord(parsed.caveman);
      const intelligentRouting = asRecord(parsed['intelligent-routing']);
      const llmRouting = asRecord(parsed['llm-routing'] ?? parsed['llm_routing']);
      const llmDiagnostics = asRecord(parsed['llm-diagnostics'] ?? parsed['llm_diagnostics']);
      const llmFixSuggester = asRecord(parsed['llm-fix-suggester'] ?? parsed['llm_fix_suggester']);
      const llmHealthQuery = asRecord(parsed['llm-health-query'] ?? parsed['llm_health_query']);
      const llmClient = asRecord(parsed['llm-client'] ?? parsed['llm_client']);
      const routingHealthCheck = asRecord(parsed['routing-health-check'] ?? parsed['routing_health_check']);
      const routingCircuitBreaker = asRecord(parsed['routing-circuit-breaker'] ?? parsed['routing_circuit_breaker']);
      const routingFallback = asRecord(parsed['routing-fallback'] ?? parsed['routing_fallback']);
      const routingPriorityFailover = asRecord(parsed['routing-priority-failover'] ?? parsed['routing_priority_failover']);
      const quota = asRecord(parsed.quota) ?? {};
      const prompts = asRecord(parsed.prompts) ?? {};
      const promptNorm = asRecord(parsed['prompt-norm'] ?? parsed['prompt_norm']) ?? {};
      const credentialConcurrency = asRecord(parsed['credential-concurrency'] ?? parsed['credential_concurrency']) ?? {};
      const credentialInFlight = asRecord(parsed['credential-in-flight'] ?? parsed['credential_in_flight']) ?? {};
      const aiAgent = asRecord(parsed['ai-agent'] ?? parsed['ai_agent']) ?? {};
      const xai = asRecord(parsed.xai) ?? {};
      const pprof = asRecord(parsed.pprof) ?? {};
      const metrics = asRecord(parsed.metrics) ?? {};
      const logsRotation = asRecord(parsed['logs-rotation']) ?? {};
      const semanticCache = asRecord(parsed['semantic-cache']) ?? {};
      const modelCapabilities = asRecord(parsed['model-capabilities']) ?? {};

      // Ensure nested objects exist
      const quotaCache = asRecord(quota.cache) ?? {};
      const quotaAntigravity = asRecord(quota.antigravity) ?? {};
      const quotaCodex = asRecord(quota.codex) ?? {};
      const promptsDefaultObj = asRecord(prompts.default) ?? {};

      const newValues: VisualConfigValues = {
        host: typeof parsed.host === 'string' ? parsed.host : '',
        port: String(parsed.port ?? ''),

        tlsEnable: Boolean(tls?.enable),
        tlsCert: typeof tls?.cert === 'string' ? tls.cert : '',
        tlsKey: typeof tls?.key === 'string' ? tls.key : '',

        rmAllowRemote: Boolean(remoteManagement?.['allow-remote']),
        rmSecretKey:
          typeof remoteManagement?.['secret-key'] === 'string'
            ? remoteManagement['secret-key']
            : '',
        rmDisableControlPanel: Boolean(remoteManagement?.['disable-control-panel']),
        rmDisableAutoUpdatePanel: Boolean(remoteManagement?.['disable-auto-update-panel']),
        rmPanelRepo:
          typeof remoteManagement?.['panel-github-repository'] === 'string'
            ? remoteManagement['panel-github-repository']
            : typeof remoteManagement?.['panel-repo'] === 'string'
              ? remoteManagement['panel-repo']
              : '',

        authDir: typeof parsed['auth-dir'] === 'string' ? parsed['auth-dir'] : '',
        apiKeysText: resolveApiKeysText(parsed),
        pluginsEnabled: Boolean(plugins?.enabled),
        pluginStoreSources: parseStringList(plugins?.['store-sources']),
        pluginStoreAuth: parsePluginStoreAuthRules(plugins?.['store-auth']),

        debug: Boolean(parsed.debug),
        loggingToFile: Boolean(parsed['logging-to-file']),
        logsMaxTotalSizeMb: String(parsed['logs-max-total-size-mb'] ?? ''),
        errorLogsMaxFiles: String(parsed['error-logs-max-files'] ?? ''),
        usageStatisticsEnabled: Boolean(parsed['usage-statistics-enabled']),
        redisUsageQueueRetentionSeconds: String(
          parsed['redis-usage-queue-retention-seconds'] ?? ''
        ),

        proxyUrl: typeof parsed['proxy-url'] === 'string' ? parsed['proxy-url'] : '',
        forceModelPrefix: Boolean(parsed['force-model-prefix']),
        passthroughHeaders: Boolean(parsed['passthrough-headers']),
        requestRetry: String(parsed['request-retry'] ?? ''),
        maxRetryCredentials: String(parsed['max-retry-credentials'] ?? ''),
        maxRetryInterval: String(parsed['max-retry-interval'] ?? ''),
        disableCooling: Boolean(parsed['disable-cooling']),
        disableImageGeneration: parseDisableImageGenerationMode(parsed['disable-image-generation']),
        gptImage2BaseModel:
          typeof parsed['gpt-image-2-base-model'] === 'string'
            ? parsed['gpt-image-2-base-model']
            : '',
        wsAuth: Boolean(parsed['ws-auth'] ?? true),

        claudeHeaderUserAgent:
          typeof claudeHeaderDefaults?.['user-agent'] === 'string'
            ? claudeHeaderDefaults['user-agent']
            : '',
        claudeHeaderPackageVersion:
          typeof claudeHeaderDefaults?.['package-version'] === 'string'
            ? claudeHeaderDefaults['package-version']
            : '',
        claudeHeaderRuntimeVersion:
          typeof claudeHeaderDefaults?.['runtime-version'] === 'string'
            ? claudeHeaderDefaults['runtime-version']
            : '',
        claudeHeaderOs: typeof claudeHeaderDefaults?.os === 'string' ? claudeHeaderDefaults.os : '',
        claudeHeaderArch:
          typeof claudeHeaderDefaults?.arch === 'string' ? claudeHeaderDefaults.arch : '',
        claudeHeaderTimeout:
          typeof claudeHeaderDefaults?.timeout === 'string' ? claudeHeaderDefaults.timeout : '',
        claudeHeaderStabilizeDeviceProfile: Boolean(
          claudeHeaderDefaults?.['stabilize-device-profile']
        ),
        codexHeaderUserAgent:
          typeof codexHeaderDefaults?.['user-agent'] === 'string'
            ? codexHeaderDefaults['user-agent']
            : '',
        codexHeaderBetaFeatures:
          typeof codexHeaderDefaults?.['beta-features'] === 'string'
            ? codexHeaderDefaults['beta-features']
            : '',

        quotaSwitchProject: Boolean(quotaExceeded?.['switch-project'] ?? false),
        quotaSwitchPreviewModel: Boolean(quotaExceeded?.['switch-preview-model'] ?? false),
        quotaAntigravityCredits: Boolean(quotaExceeded?.['antigravity-credits'] ?? false),

        routingStrategy: parseRoutingStrategy(routing?.strategy),
        routingSessionAffinity: Boolean(
          routing?.['session-affinity'] ?? routing?.sessionAffinity ?? routing?.['sessionAffinity']
        ),
        routingSessionAffinityTTL:
          typeof routing?.['session-affinity-ttl'] === 'string'
            ? routing['session-affinity-ttl']
            : typeof routing?.sessionAffinityTTL === 'string'
              ? routing.sessionAffinityTTL
              : typeof routing?.['sessionAffinityTTL'] === 'string'
                ? routing['sessionAffinityTTL']
                : '',

        payloadDefaultRules: parsePayloadRules(payload?.default),
        payloadDefaultRawRules: parseRawPayloadRules(payload?.['default-raw']),
        payloadOverrideRules: parsePayloadRules(payload?.override),
        payloadOverrideRawRules: parseRawPayloadRules(payload?.['override-raw']),
        payloadFilterRules: parsePayloadFilterRules(payload?.filter),

        streaming: {
          keepaliveSeconds: String(streaming?.['keepalive-seconds'] ?? ''),
          bootstrapRetries: String(streaming?.['bootstrap-retries'] ?? ''),
          nonstreamKeepaliveInterval: String(parsed['nonstream-keepalive-interval'] ?? ''),
        },
        rtk: {
          enabled: Boolean(rtk?.enabled ?? false),
          ultraMode: Boolean(rtk?.['ultra-mode'] ?? rtk?.ultraMode ?? false),
          binary: typeof rtk?.binary === 'string' ? rtk.binary : '',
          poolSize: String(rtk?.['pool-size'] ?? rtk?.poolSize ?? ''),
          timeout: typeof rtk?.timeout === 'string' ? rtk.timeout : '',
        },
        caveman: {
          enabled: Boolean(caveman?.enabled ?? false),
          level: (caveman?.level as 'lite' | 'full' | 'ultra') ?? 'full',
          cacheSize: String(caveman?.['cache-size'] ?? caveman?.cacheSize ?? ''),
          threshold: Number(caveman?.threshold ?? 0),
        },
        // LLM Features
        intelligentRouting: {
          enabled: Boolean(intelligentRouting?.enabled ?? false),
          mode: typeof intelligentRouting?.mode === 'string' ? intelligentRouting.mode : 'local',
          triggerModels: parseStringList(intelligentRouting?.['trigger-models']),
          preferredProviders: parseStringList(intelligentRouting?.['preferred-providers']),
          defaultBudget: typeof intelligentRouting?.['default-budget'] === 'string' ? intelligentRouting['default-budget'] : 'balanced',
          confidenceThreshold: Number(intelligentRouting?.['confidence-threshold'] ?? 0.7),
          decisionCacheTTL: typeof intelligentRouting?.['decision-cache-ttl'] === 'string' ? intelligentRouting['decision-cache-ttl'] : '10m',
          modelAliases: [], // Not parsing from YAML for now
        },
        llmRouting: {
          enabled: Boolean(llmRouting?.enabled ?? false),
          llmProvider: typeof llmRouting?.['llm-provider'] === 'string' ? llmRouting['llm-provider'] : 'openrouter',
          llmModel: typeof llmRouting?.['llm-model'] === 'string' ? llmRouting['llm-model'] : 'google/gemini-2.5-flash',
          cacheTTLSeconds: Number(llmRouting?.['cache-ttl-seconds'] ?? 120),
          fallbackToStatic: Boolean(llmRouting?.['fallback-to-static'] ?? true),
          timeoutSeconds: Number(llmRouting?.['timeout-seconds'] ?? 2),
          costWeight: Number(llmRouting?.['cost-weight'] ?? 0.3),
          latencyWeight: Number(llmRouting?.['latency-weight'] ?? 0.3),
          qualityWeight: Number(llmRouting?.['quality-weight'] ?? 0.4),
          analysisCompression: {
            enabled: Boolean((llmRouting?.['analysis-compression'] as Record<string, unknown>)?.enabled ?? false),
            stripNoise: Boolean((llmRouting?.['analysis-compression'] as Record<string, unknown>)?.['strip-noise'] ?? false),
            compressRepeats: Boolean((llmRouting?.['analysis-compression'] as Record<string, unknown>)?.['compress-repeats'] ?? false),
            maxPromptChars: Number((llmRouting?.['analysis-compression'] as Record<string, unknown>)?.['max-prompt-chars'] ?? 0),
          },
        },
        llmDiagnostics: (() => {
          const diag = (llmDiagnostics ?? {}) as Record<string, unknown>;
          const errorDiag = (diag['error-diagnosis'] as Record<string, unknown>) ?? {};
          const logAnalysis = (diag['log-analysis'] as Record<string, unknown>) ?? {};
          return {
            enabled: Boolean(diag.enabled ?? false),
            modelHint: typeof diag['model-hint'] === 'string' ? diag['model-hint'] : 'gpt-4o-mini',
            providerHint: typeof diag['provider-hint'] === 'string' ? diag['provider-hint'] : 'openrouter',
            errorDiagnosis: {
              enabled: Boolean(errorDiag.enabled ?? false),
              captureStackTrace: Boolean(errorDiag['capture-stack-trace'] ?? true),
              logContextLines: Number(errorDiag['log-context-lines'] ?? 50),
              minSeverity: typeof errorDiag['min-severity'] === 'string' ? errorDiag['min-severity'] : 'medium',
              cooldown: typeof errorDiag.cooldown === 'string' ? errorDiag.cooldown : '1h',
            },
            logAnalysis: {
              enabled: Boolean(logAnalysis.enabled ?? false),
              interval: typeof logAnalysis.interval === 'string' ? logAnalysis.interval : '5m',
              windowSize: typeof logAnalysis['window-size'] === 'string' ? logAnalysis['window-size'] : '5m',
              maxEntries: Number(logAnalysis['max-entries'] ?? 100),
              minSeverity: typeof logAnalysis['min-severity'] === 'string' ? logAnalysis['min-severity'] : 'warn',
              alertOnAnomaly: Boolean(logAnalysis['alert-on-anomaly'] ?? false),
            },
          };
        })() as LLMDiagnosticsConfig,
        llmFixSuggester: {
          enabled: Boolean(llmFixSuggester?.enabled ?? false),
          recurrenceThreshold: Number(llmFixSuggester?.['recurrence-threshold'] ?? 3),
          timeWindowHours: Number(llmFixSuggester?.['time-window-hours'] ?? 24),
          modelHint: typeof llmFixSuggester?.['model-hint'] === 'string' ? llmFixSuggester['model-hint'] : 'gpt-4o-mini',
          providerHint: typeof llmFixSuggester?.['provider-hint'] === 'string' ? llmFixSuggester['provider-hint'] : 'openrouter',
        },
        llmHealthQuery: {
          enabled: Boolean(llmHealthQuery?.enabled ?? false),
          modelHint: typeof llmHealthQuery?.['model-hint'] === 'string' ? llmHealthQuery['model-hint'] : 'gpt-4o-mini',
          providerHint: typeof llmHealthQuery?.['provider-hint'] === 'string' ? llmHealthQuery['provider-hint'] : 'openai',
          timeoutSeconds: Number(llmHealthQuery?.['timeout-seconds'] ?? 5),
        },
        llmClient: {
          cacheEnabled: Boolean(llmClient?.['cache-enabled'] ?? true),
          cacheTTL: typeof llmClient?.['cache-ttl'] === 'string' ? llmClient['cache-ttl'] : '5m',
          cacheMaxItems: Number(llmClient?.['cache-max-items'] ?? 1000),
          modelHints: llmClient?.['model-hints'] ? Object.fromEntries(Object.entries(llmClient['model-hints']).map(([k, v]) => [k, String(v)])) : {
            analysis: 'gpt-4o-mini',
            routing: 'gpt-4o-mini',
            diagnostics: 'gpt-4o-mini',
            config_gen: 'gpt-4o-mini',
            health_query: 'gpt-4o-mini',
            fix_suggestion: 'gpt-4o-mini',
          },
        },
        // Routing Extended
        routingHealthCheck: {
          enabled: Boolean(routingHealthCheck?.enabled ?? true),
          interval: typeof routingHealthCheck?.interval === 'string' ? routingHealthCheck.interval : '30s',
          timeout: typeof routingHealthCheck?.timeout === 'string' ? routingHealthCheck.timeout : '5s',
          failureThreshold: Number(routingHealthCheck?.['failure-threshold'] ?? 3),
          successThreshold: Number(routingHealthCheck?.['success-threshold'] ?? 2),
        },
        routingCircuitBreaker: {
          enabled: Boolean(routingCircuitBreaker?.enabled ?? true),
          failureThreshold: Number(routingCircuitBreaker?.['failure-threshold'] ?? 5),
          successThreshold: Number(routingCircuitBreaker?.['success-threshold'] ?? 2),
          timeout: typeof routingCircuitBreaker?.timeout === 'string' ? routingCircuitBreaker.timeout : '60s',
        },
        routingFallback: {
          enabled: Boolean(routingFallback?.enabled ?? false),
          persistToSQLite: Boolean(routingFallback?.['persist-to-sqlite'] ?? false),
          defaultChains: {}, // Not parsing from YAML for now
        },
        routingChains: {}, // Not parsing from YAML for now
        routingPriorityFailover: {
          enabled: Boolean(routingPriorityFailover?.enabled ?? false),
          defaultChain: typeof routingPriorityFailover?.['default-chain'] === 'string' ? routingPriorityFailover['default-chain'] : '',
          healthCheckInterval: typeof routingPriorityFailover?.['health-check-interval'] === 'string' ? routingPriorityFailover['health-check-interval'] : '',
          enableManagementAPI: Boolean(routingPriorityFailover?.['enable-management-api'] ?? false),
        },
        // Quota Extended
        quota: {
          enabled: Boolean(quota?.enabled ?? true),
          dailyLimit: Number(quota?.['daily-limit'] ?? 0),
          tokenLimit: Number(quota?.['token-limit'] ?? 0),
          storeDir: typeof quota?.['store-dir'] === 'string' ? quota['store-dir'] : '',
          cache: {
            activeTTL: typeof quotaCache?.['active-ttl'] === 'string' ? quotaCache['active-ttl'] : '5m',
            exhaustedTTL: typeof quotaCache?.['exhausted-ttl'] === 'string' ? quotaCache['exhausted-ttl'] : '5m',
            refreshInterval: typeof quotaCache?.['refresh-interval'] === 'string' ? quotaCache['refresh-interval'] : '1m',
            maxConcurrentRefreshes: Number(quotaCache?.['max-concurrent-refreshes'] ?? 10),
            persistToSQLite: Boolean(quotaCache?.['persist-to-sqlite'] ?? true),
          },
          antigravity: {
            familyWindows: Boolean(quotaAntigravity?.['family-windows'] ?? true),
          },
          codex: {
            sessionScope: Boolean(quotaCodex?.['session-scope'] ?? true),
            weeklyScope: Boolean(quotaCodex?.['weekly-scope'] ?? true),
          },
        },
        // Protocol Configs
        prompts: {
          enabled: Boolean(prompts?.enabled ?? false),
          default: {
            system: typeof promptsDefaultObj?.system === 'string' ? promptsDefaultObj.system : '',
            systemMode: typeof promptsDefaultObj?.['system-mode'] === 'string' ? promptsDefaultObj['system-mode'] : 'merge',
            prependUser: typeof promptsDefaultObj?.['prepend-user'] === 'string' ? promptsDefaultObj['prepend-user'] : '',
            appendUser: typeof promptsDefaultObj?.['append-user'] === 'string' ? promptsDefaultObj['append-user'] : '',
          },
          presets: [], // Not parsing from YAML for now
        },
        promptNorm: {
          enabled: Boolean(promptNorm?.enabled ?? false),
          maxContextTokens: Number(promptNorm?.['max-context-tokens'] ?? 0),
          preserveLastNBlocks: Number(promptNorm?.['preserve-last-n-blocks'] ?? 0),
          minDropTokens: Number(promptNorm?.['min-drop-tokens'] ?? 0),
          maxDropRatio: Number(promptNorm?.['max-drop-ratio'] ?? 0),
          truncateHeadKeep: Number(promptNorm?.['truncate-head-keep'] ?? 0),
          truncateTailKeep: Number(promptNorm?.['truncate-tail-keep'] ?? 0),
          pruneToolResults: Boolean(promptNorm?.['prune-tool-results'] ?? false),
          selectSystemPrompt: Boolean(promptNorm?.['select-system-prompt'] ?? false),
          systemPromptMode: typeof promptNorm?.['system-prompt-mode'] === 'string' ? promptNorm['system-prompt-mode'] : 'off',
          allowPrefixMutation: Boolean(promptNorm?.['allow-prefix-mutation'] ?? false),
          promptOverrides: promptNorm?.['prompt-overrides'] ? Object.fromEntries(Object.entries(promptNorm['prompt-overrides']).map(([k, v]) => [k, String(v)])) : {},
          debugLog: Boolean(promptNorm?.['debug-log'] ?? false),
        },
        // Advanced
        credentialConcurrency: {
          lifecycleConfigRevision: Number(credentialConcurrency?.['lifecycle-config-revision'] ?? 0),
          observationBarrierRevision: Number(credentialConcurrency?.['observation-barrier-revision'] ?? 0),
          cpaHeartbeatTimeout: typeof credentialConcurrency?.['cpa-heartbeat-timeout'] === 'string' ? credentialConcurrency['cpa-heartbeat-timeout'] : '3s',
          cpaCancelBound: typeof credentialConcurrency?.['cpa-cancel-bound'] === 'string' ? credentialConcurrency['cpa-cancel-bound'] : '5s',
          reclaimGrace: typeof credentialConcurrency?.['reclaim-grace'] === 'string' ? credentialConcurrency['reclaim-grace'] : '5s',
          cleanupInterval: typeof credentialConcurrency?.['cleanup-interval'] === 'string' ? credentialConcurrency['cleanup-interval'] : '5s',
          releaseFlushInterval: typeof credentialConcurrency?.['release-flush-interval'] === 'string' ? credentialConcurrency['release-flush-interval'] : '250ms',
          releaseMaxBackoff: typeof credentialConcurrency?.['release-max-backoff'] === 'string' ? credentialConcurrency['release-max-backoff'] : '2s',
          busyRetryMin: typeof credentialConcurrency?.['busy-retry-min'] === 'string' ? credentialConcurrency['busy-retry-min'] : '250ms',
          busyRetryMax: typeof credentialConcurrency?.['busy-retry-max'] === 'string' ? credentialConcurrency['busy-retry-max'] : '1s',
          maxLimit: Number(credentialConcurrency?.['max-limit'] ?? 1000000),
        },
        credentialInFlight: {
          snapshotInterval: typeof credentialInFlight?.['snapshot-interval'] === 'string' ? credentialInFlight['snapshot-interval'] : '2s',
          staleAfter: typeof credentialInFlight?.['stale-after'] === 'string' ? credentialInFlight['stale-after'] : '10s',
          maxPartBytes: Number(credentialInFlight?.['max-part-bytes'] ?? 262144),
          maxPartCount: Number(credentialInFlight?.['max-part-count'] ?? 64),
          maxRevisionBytes: Number(credentialInFlight?.['max-revision-bytes'] ?? 16777216),
          maxAggregateGroups: Number(credentialInFlight?.['max-aggregate-groups'] ?? 100000),
          maxDetails: Number(credentialInFlight?.['max-details'] ?? 10000),
          maxStringBytes: Number(credentialInFlight?.['max-string-bytes'] ?? 256),
          stagingRetention: typeof credentialInFlight?.['staging-retention'] === 'string' ? credentialInFlight['staging-retention'] : '1m',
        },
        // Protocol Configs
        codexHeaderDefaults: {
          userAgent: typeof codexHeaderDefaults?.['user-agent'] === 'string' ? codexHeaderDefaults['user-agent'] : '',
          betaFeatures: typeof codexHeaderDefaults?.['beta-features'] === 'string' ? codexHeaderDefaults['beta-features'] : '',
        },
        claudeHeaderDefaults: {
          userAgent: typeof claudeHeaderDefaults?.['user-agent'] === 'string' ? claudeHeaderDefaults['user-agent'] : '',
          packageVersion: typeof claudeHeaderDefaults?.['package-version'] === 'string' ? claudeHeaderDefaults['package-version'] : '',
          runtimeVersion: typeof claudeHeaderDefaults?.['runtime-version'] === 'string' ? claudeHeaderDefaults['runtime-version'] : '',
          os: typeof claudeHeaderDefaults?.os === 'string' ? claudeHeaderDefaults.os : '',
          arch: typeof claudeHeaderDefaults?.arch === 'string' ? claudeHeaderDefaults.arch : '',
          timeout: typeof claudeHeaderDefaults?.timeout === 'string' ? claudeHeaderDefaults.timeout : '',
          stabilizeDeviceProfile: Boolean(claudeHeaderDefaults?.['stabilize-device-profile']),
        },
        xai: {
          liveMediaRelay: {
            enabled: Boolean((xai as { 'live-media-relay'?: { enabled?: unknown } })?.['live-media-relay']?.enabled ?? false),
            maxSessions: Number((xai as { 'live-media-relay'?: { 'max-sessions'?: unknown } })?.['live-media-relay']?.['max-sessions'] ?? 0),
            disablePrivateRemoteIPs: Boolean((xai as { 'live-media-relay'?: { 'disable-private-remote-ips'?: unknown } })?.['live-media-relay']?.['disable-private-remote-ips'] ?? false),
            publicIP: typeof (xai as { 'live-media-relay'?: { 'public-ip'?: string } })?.['live-media-relay']?.['public-ip'] === 'string' ? (xai as { 'live-media-relay'?: { 'public-ip'?: string } })?.['live-media-relay']?.['public-ip'] ?? '' : '',
            udpPortMin: Number((xai as { 'live-media-relay'?: { 'udp-port-min'?: unknown } })?.['live-media-relay']?.['udp-port-min'] ?? 0),
            udpPortMax: Number((xai as { 'live-media-relay'?: { 'udp-port-max'?: unknown } })?.['live-media-relay']?.['udp-port-max'] ?? 0),
            iceServers: [], // Not parsing from YAML for now
          },
        },
        // Infrastructure
        tls: {
          enable: Boolean(tls?.enable),
          cert: typeof tls?.cert === 'string' ? tls.cert : '',
          key: typeof tls?.key === 'string' ? tls.key : '',
        },
        pprof: {
          enable: Boolean(pprof?.enabled),
          addr: typeof pprof?.addr === 'string' ? pprof.addr : '',
        },
        metrics: {
          enabled: Boolean(metrics?.enabled),
          path: typeof metrics?.path === 'string' ? metrics.path : '/metrics',
        },
        logsRotation: {
          maxSizeMB: Number(logsRotation?.['max-size-mb'] ?? 0),
          maxAgeDays: Number(logsRotation?.['max-age-days'] ?? 0),
          maxBackups: Number(logsRotation?.['max-backups'] ?? 0),
          compress: Boolean(logsRotation?.compress),
        },
        semanticCache: {
          enabled: Boolean(semanticCache?.enabled ?? false),
          similarityThreshold: Number(semanticCache?.['similarity-threshold'] ?? 0.85),
          maxEntries: Number(semanticCache?.['max-entries'] ?? 10000),
          ttl: typeof semanticCache?.ttl === 'string' ? semanticCache.ttl : '24h',
          embeddingModel: typeof semanticCache?.['embedding-model'] === 'string' ? semanticCache['embedding-model'] : 'bge-small-en-v1.5',
          embeddingModelPath: typeof semanticCache?.['embedding-model-path'] === 'string' ? semanticCache['embedding-model-path'] : '',
          tokenizerPath: typeof semanticCache?.['tokenizer-path'] === 'string' ? semanticCache['tokenizer-path'] : '',
          cacheDir: typeof semanticCache?.['cache-dir'] === 'string' ? semanticCache['cache-dir'] : '',
          onlyCache2xx: Boolean(semanticCache?.['only-cache-2xx'] ?? true),
          excludeReasoningModels: Boolean(semanticCache?.['exclude-reasoning-models'] ?? true),
        },
        modelCapabilities: {
          enabled: Boolean((modelCapabilities as Record<string, unknown>)?.enabled ?? false),
          autoDiscover: Boolean((modelCapabilities as Record<string, unknown>)?.['auto-discover'] ?? false),
          persistToSQLite: Boolean((modelCapabilities as Record<string, unknown>)?.['persist-to-sqlite'] ?? false),
          cacheTTL: typeof (modelCapabilities as Record<string, unknown>)?.['cache-ttl'] === 'string' ? (modelCapabilities as Record<string, unknown>)['cache-ttl'] as string : '',
          costRules: {
            enabled: Boolean(((modelCapabilities as Record<string, unknown>)?.['cost-rules'] as Record<string, unknown>)?.enabled ?? false),
            monthlyBudgetUSD: Number(((modelCapabilities as Record<string, unknown>)?.['cost-rules'] as Record<string, unknown>)?.['monthly-budget-usd'] ?? 0),
            rules: [], // Not parsing from YAML for now
          },
        },
        // Simple fields
        transientErrorCooldownSeconds: Number(parsed['transient-error-cooldown-seconds'] ?? 0),
        authAutoRefreshWorkers: String(parsed['auth-auto-refresh-workers'] ?? ''),
        tokenRotationEnabled: Boolean(parsed['token-rotation-enabled'] ?? false),
        tokenRotationRefreshBufferSeconds: Number(parsed['token-rotation-refresh-buffer-seconds'] ?? 0),
        commercialMode: Boolean(parsed['commercial-mode'] ?? false),
        antigravitySignatureCacheEnabled: parsed['antigravity-signature-cache-enabled'] !== undefined ? Boolean(parsed['antigravity-signature-cache-enabled']) : true,
        antigravitySignatureBypassStrict: Boolean(parsed['antigravity-signature-bypass-strict'] ?? false),
        disableClaudeCloakMode: Boolean(parsed['disable-claude-cloak-mode'] ?? false),
        // Advanced section fields
        antigravitySensitiveWords: parseStringList(parsed['antigravity-sensitive-words']),
        devinSensitiveWords: parseStringList(parsed['devin-sensitive-words']),
        // aiAgent
        aiAgent: {
          enabled: Boolean(aiAgent?.enabled ?? false),
          mode: typeof aiAgent?.mode === 'string' ? aiAgent.mode : 'integrated',
          routingBackend: typeof aiAgent?.['routing-backend'] === 'string' ? aiAgent['routing-backend'] : 'tiagent',
          tiAgentURL: typeof aiAgent?.['tiagent-url'] === 'string' ? aiAgent['tiagent-url'] : '',
          tiAgentTimeout: Number(aiAgent?.['tiagent-timeout'] ?? 30),
          fallbackToStatic: Boolean(aiAgent?.['fallback-to-static'] ?? true),
          cacheTTLSeconds: Number(aiAgent?.['cache-ttl-seconds'] ?? 120),
          defaultProvider: typeof aiAgent?.['default-provider'] === 'string' ? aiAgent['default-provider'] : '',
          costWeight: Number(aiAgent?.['cost-weight'] ?? 0.3),
          latencyWeight: Number(aiAgent?.['latency-weight'] ?? 0.3),
          qualityWeight: Number(aiAgent?.['quality-weight'] ?? 0.4),
        },
      };

      dispatch({ type: 'load_success', values: newValues });
      return { ok: true as const };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid YAML';
      dispatch({ type: 'load_error', error: message });
      return { ok: false as const, error: message };
    }
  }, []);

  const applyVisualChangesToYaml = useCallback(
    (currentYaml: string): string => {
      try {
        const doc = parseDocument(currentYaml);
        if (doc.errors.length > 0) return currentYaml;
        if (!isMap(doc.contents)) {
          doc.contents = doc.createNode({}) as unknown as typeof doc.contents;
        }
        const values = visualValues;
        const shouldWritePluginStoreAuth = dirtyFields.has('pluginStoreAuth');

        if (dirtyFields.has('host')) setStringInDoc(doc, ['host'], values.host);
        if (dirtyFields.has('port')) setIntFromStringInDoc(doc, ['port'], values.port);

        const tlsDirty =
          dirtyFields.has('tlsEnable') || dirtyFields.has('tlsCert') || dirtyFields.has('tlsKey');
        if (tlsDirty) {
          ensureMapInDoc(doc, ['tls']);
          if (dirtyFields.has('tlsEnable')) {
            setBooleanInDoc(doc, ['tls', 'enable'], values.tlsEnable);
          }
          if (dirtyFields.has('tlsCert')) setStringInDoc(doc, ['tls', 'cert'], values.tlsCert);
          if (dirtyFields.has('tlsKey')) setStringInDoc(doc, ['tls', 'key'], values.tlsKey);
          deleteIfMapEmpty(doc, ['tls']);
        }

        const remoteManagementDirty =
          dirtyFields.has('rmAllowRemote') ||
          dirtyFields.has('rmSecretKey') ||
          dirtyFields.has('rmDisableControlPanel') ||
          dirtyFields.has('rmDisableAutoUpdatePanel') ||
          dirtyFields.has('rmPanelRepo');
        if (remoteManagementDirty) {
          ensureMapInDoc(doc, ['remote-management']);
          if (dirtyFields.has('rmAllowRemote')) {
            setBooleanInDoc(doc, ['remote-management', 'allow-remote'], values.rmAllowRemote);
          }
          if (dirtyFields.has('rmSecretKey')) {
            setStringInDoc(doc, ['remote-management', 'secret-key'], values.rmSecretKey);
          }
          if (dirtyFields.has('rmDisableControlPanel')) {
            setBooleanInDoc(
              doc,
              ['remote-management', 'disable-control-panel'],
              values.rmDisableControlPanel
            );
          }
          if (dirtyFields.has('rmDisableAutoUpdatePanel')) {
            setBooleanInDoc(
              doc,
              ['remote-management', 'disable-auto-update-panel'],
              values.rmDisableAutoUpdatePanel
            );
          }
          if (dirtyFields.has('rmPanelRepo')) {
            setStringInDoc(
              doc,
              ['remote-management', 'panel-github-repository'],
              values.rmPanelRepo
            );
          }
          if (dirtyFields.has('rmPanelRepo') && docHas(doc, ['remote-management', 'panel-repo'])) {
            doc.deleteIn(['remote-management', 'panel-repo']);
          }
          deleteIfMapEmpty(doc, ['remote-management']);
        }

        if (dirtyFields.has('authDir')) setStringInDoc(doc, ['auth-dir'], values.authDir);
        if (dirtyFields.has('apiKeysText')) {
          const apiKeys = values.apiKeysText
            .split('\n')
            .map((key) => key.trim())
            .filter(Boolean);
          if (apiKeys.length > 0) {
            doc.setIn(['api-keys'], apiKeys);
          } else if (docHas(doc, ['api-keys'])) {
            doc.deleteIn(['api-keys']);
          }
          deleteLegacyApiKeysProvider(doc);
        }

        const pluginsDirty =
          dirtyFields.has('pluginsEnabled') ||
          dirtyFields.has('pluginStoreSources') ||
          shouldWritePluginStoreAuth;
        if (pluginsDirty) {
          ensureMapInDoc(doc, ['plugins']);
          if (dirtyFields.has('pluginsEnabled')) {
            setBooleanInDoc(doc, ['plugins', 'enabled'], values.pluginsEnabled);
          }
          if (dirtyFields.has('pluginStoreSources')) {
            setStringListInDoc(doc, ['plugins', 'store-sources'], values.pluginStoreSources);
          }
          if (shouldWritePluginStoreAuth) {
            const storeAuth = serializePluginStoreAuthForYaml(values.pluginStoreAuth);
            if (storeAuth.length > 0) {
              doc.setIn(['plugins', 'store-auth'], storeAuth);
            } else if (docHas(doc, ['plugins', 'store-auth'])) {
              doc.deleteIn(['plugins', 'store-auth']);
            }
          }
          deleteIfMapEmpty(doc, ['plugins']);
        }

        if (dirtyFields.has('debug')) setBooleanInDoc(doc, ['debug'], values.debug);
        if (dirtyFields.has('commercialMode')) {
          setBooleanInDoc(doc, ['commercial-mode'], values.commercialMode);
        }
        if (dirtyFields.has('loggingToFile')) {
          setBooleanInDoc(doc, ['logging-to-file'], values.loggingToFile);
        }
        if (dirtyFields.has('logsMaxTotalSizeMb')) {
          setIntFromStringInDoc(doc, ['logs-max-total-size-mb'], values.logsMaxTotalSizeMb);
        }
        if (dirtyFields.has('errorLogsMaxFiles')) {
          setIntFromStringInDoc(doc, ['error-logs-max-files'], values.errorLogsMaxFiles);
        }
        if (dirtyFields.has('usageStatisticsEnabled')) {
          setBooleanInDoc(doc, ['usage-statistics-enabled'], values.usageStatisticsEnabled);
        }
        if (dirtyFields.has('redisUsageQueueRetentionSeconds')) {
          setIntFromStringInDoc(
            doc,
            ['redis-usage-queue-retention-seconds'],
            values.redisUsageQueueRetentionSeconds
          );
        }

        if (dirtyFields.has('proxyUrl')) setStringInDoc(doc, ['proxy-url'], values.proxyUrl);
        if (dirtyFields.has('forceModelPrefix')) {
          setBooleanInDoc(doc, ['force-model-prefix'], values.forceModelPrefix);
        }
        if (dirtyFields.has('passthroughHeaders')) {
          setBooleanInDoc(doc, ['passthrough-headers'], values.passthroughHeaders);
        }
        if (dirtyFields.has('requestRetry')) {
          setIntFromStringInDoc(doc, ['request-retry'], values.requestRetry);
        }
        if (dirtyFields.has('maxRetryCredentials')) {
          setIntFromStringInDoc(doc, ['max-retry-credentials'], values.maxRetryCredentials);
        }
        if (dirtyFields.has('maxRetryInterval')) {
          setIntFromStringInDoc(doc, ['max-retry-interval'], values.maxRetryInterval);
        }
        if (dirtyFields.has('disableCooling')) {
          setBooleanInDoc(doc, ['disable-cooling'], values.disableCooling);
        }
        if (dirtyFields.has('disableImageGeneration')) {
          setDisableImageGenerationInDoc(
            doc,
            ['disable-image-generation'],
            values.disableImageGeneration
          );
        }
        if (dirtyFields.has('gptImage2BaseModel')) {
          setStringInDoc(doc, ['gpt-image-2-base-model'], values.gptImage2BaseModel);
        }
        if (dirtyFields.has('authAutoRefreshWorkers')) {
          setIntFromStringInDoc(doc, ['auth-auto-refresh-workers'], values.authAutoRefreshWorkers);
        }
        // ws-auth backend-defaults to true, so an explicit false must be
        // materialized even when the key is absent (setBooleanInDoc alone
        // would skip it, losing the user's choice).
        if (dirtyFields.has('wsAuth')) {
          if (values.wsAuth) setBooleanInDoc(doc, ['ws-auth'], true);
          else doc.setIn(['ws-auth'], false);
        }
        if (dirtyFields.has('antigravitySignatureCacheEnabled')) {
          if (
            docHas(doc, ['antigravity-signature-cache-enabled']) ||
            !values.antigravitySignatureCacheEnabled
          ) {
            doc.setIn(
              ['antigravity-signature-cache-enabled'],
              values.antigravitySignatureCacheEnabled
            );
          }
        }
        if (dirtyFields.has('antigravitySignatureBypassStrict')) {
          setBooleanInDoc(
            doc,
            ['antigravity-signature-bypass-strict'],
            values.antigravitySignatureBypassStrict
          );
        }

        const claudeHeadersDirty =
          dirtyFields.has('claudeHeaderUserAgent') ||
          dirtyFields.has('claudeHeaderPackageVersion') ||
          dirtyFields.has('claudeHeaderRuntimeVersion') ||
          dirtyFields.has('claudeHeaderOs') ||
          dirtyFields.has('claudeHeaderArch') ||
          dirtyFields.has('claudeHeaderTimeout') ||
          dirtyFields.has('claudeHeaderStabilizeDeviceProfile');
        if (claudeHeadersDirty) {
          ensureMapInDoc(doc, ['claude-header-defaults']);
          if (dirtyFields.has('claudeHeaderUserAgent')) {
            setStringInDoc(
              doc,
              ['claude-header-defaults', 'user-agent'],
              values.claudeHeaderUserAgent
            );
          }
          if (dirtyFields.has('claudeHeaderPackageVersion')) {
            setStringInDoc(
              doc,
              ['claude-header-defaults', 'package-version'],
              values.claudeHeaderPackageVersion
            );
          }
          if (dirtyFields.has('claudeHeaderRuntimeVersion')) {
            setStringInDoc(
              doc,
              ['claude-header-defaults', 'runtime-version'],
              values.claudeHeaderRuntimeVersion
            );
          }
          if (dirtyFields.has('claudeHeaderOs')) {
            setStringInDoc(doc, ['claude-header-defaults', 'os'], values.claudeHeaderOs);
          }
          if (dirtyFields.has('claudeHeaderArch')) {
            setStringInDoc(doc, ['claude-header-defaults', 'arch'], values.claudeHeaderArch);
          }
          if (dirtyFields.has('claudeHeaderTimeout')) {
            setStringInDoc(doc, ['claude-header-defaults', 'timeout'], values.claudeHeaderTimeout);
          }
          if (dirtyFields.has('claudeHeaderStabilizeDeviceProfile')) {
            setBooleanInDoc(
              doc,
              ['claude-header-defaults', 'stabilize-device-profile'],
              values.claudeHeaderStabilizeDeviceProfile
            );
          }
          deleteIfMapEmpty(doc, ['claude-header-defaults']);
        }

        const codexHeadersDirty =
          dirtyFields.has('codexHeaderUserAgent') || dirtyFields.has('codexHeaderBetaFeatures');
        if (codexHeadersDirty) {
          ensureMapInDoc(doc, ['codex-header-defaults']);
          if (dirtyFields.has('codexHeaderUserAgent')) {
            setStringInDoc(
              doc,
              ['codex-header-defaults', 'user-agent'],
              values.codexHeaderUserAgent
            );
          }
          if (dirtyFields.has('codexHeaderBetaFeatures')) {
            setStringInDoc(
              doc,
              ['codex-header-defaults', 'beta-features'],
              values.codexHeaderBetaFeatures
            );
          }
          deleteIfMapEmpty(doc, ['codex-header-defaults']);
        }

        const quotaDirty =
          dirtyFields.has('quotaSwitchProject') ||
          dirtyFields.has('quotaSwitchPreviewModel') ||
          dirtyFields.has('quotaAntigravityCredits');
        if (quotaDirty) {
          ensureMapInDoc(doc, ['quota-exceeded']);
          if (dirtyFields.has('quotaSwitchProject')) {
            doc.setIn(['quota-exceeded', 'switch-project'], values.quotaSwitchProject);
          }
          if (dirtyFields.has('quotaSwitchPreviewModel')) {
            doc.setIn(['quota-exceeded', 'switch-preview-model'], values.quotaSwitchPreviewModel);
          }
          if (dirtyFields.has('quotaAntigravityCredits')) {
            doc.setIn(['quota-exceeded', 'antigravity-credits'], values.quotaAntigravityCredits);
          }
          deleteIfMapEmpty(doc, ['quota-exceeded']);
        }

        const routingDirty =
          dirtyFields.has('routingStrategy') ||
          dirtyFields.has('routingSessionAffinity') ||
          dirtyFields.has('routingSessionAffinityTTL');
        if (routingDirty) {
          ensureMapInDoc(doc, ['routing']);
          if (dirtyFields.has('routingStrategy')) {
            doc.setIn(['routing', 'strategy'], values.routingStrategy);
          }
          if (dirtyFields.has('routingSessionAffinity')) {
            setBooleanInDoc(doc, ['routing', 'session-affinity'], values.routingSessionAffinity);
          }
          if (dirtyFields.has('routingSessionAffinityTTL')) {
            setStringInDoc(
              doc,
              ['routing', 'session-affinity-ttl'],
              values.routingSessionAffinityTTL
            );
          }
          deleteIfMapEmpty(doc, ['routing']);
        }

        const keepaliveSeconds =
          typeof values.streaming?.keepaliveSeconds === 'string'
            ? values.streaming.keepaliveSeconds
            : '';
        const bootstrapRetries =
          typeof values.streaming?.bootstrapRetries === 'string'
            ? values.streaming.bootstrapRetries
            : '';
        const nonstreamKeepaliveInterval =
          typeof values.streaming?.nonstreamKeepaliveInterval === 'string'
            ? values.streaming.nonstreamKeepaliveInterval
            : '';

        const streamingDirty =
          dirtyFields.has('streaming.keepaliveSeconds') ||
          dirtyFields.has('streaming.bootstrapRetries');
        if (streamingDirty) {
          ensureMapInDoc(doc, ['streaming']);
          if (dirtyFields.has('streaming.keepaliveSeconds')) {
            setIntFromStringInDoc(doc, ['streaming', 'keepalive-seconds'], keepaliveSeconds);
          }
          if (dirtyFields.has('streaming.bootstrapRetries')) {
            setIntFromStringInDoc(doc, ['streaming', 'bootstrap-retries'], bootstrapRetries);
          }
          deleteIfMapEmpty(doc, ['streaming']);
        }

        if (dirtyFields.has('streaming.nonstreamKeepaliveInterval')) {
          setIntFromStringInDoc(doc, ['nonstream-keepalive-interval'], nonstreamKeepaliveInterval);
        }

        const rtkDirty =
          dirtyFields.has('rtk.enabled') ||
          dirtyFields.has('rtk.ultraMode') ||
          dirtyFields.has('rtk.binary') ||
          dirtyFields.has('rtk.poolSize') ||
          dirtyFields.has('rtk.timeout');
        if (rtkDirty) {
          ensureMapInDoc(doc, ['rtk']);
          if (dirtyFields.has('rtk.enabled')) {
            setBooleanInDoc(doc, ['rtk', 'enabled'], values.rtk.enabled);
          }
          if (dirtyFields.has('rtk.ultraMode')) {
            setBooleanInDoc(doc, ['rtk', 'ultra-mode'], values.rtk.ultraMode);
          }
          if (dirtyFields.has('rtk.binary')) {
            setStringInDoc(doc, ['rtk', 'binary'], values.rtk.binary);
          }
          if (dirtyFields.has('rtk.poolSize')) {
            setStringInDoc(doc, ['rtk', 'pool-size'], values.rtk.poolSize);
          }
          if (dirtyFields.has('rtk.timeout')) {
            setStringInDoc(doc, ['rtk', 'timeout'], values.rtk.timeout);
          }
          deleteIfMapEmpty(doc, ['rtk']);
        }

        const cavemanDirty =
          dirtyFields.has('caveman.enabled') ||
          dirtyFields.has('caveman.level') ||
          dirtyFields.has('caveman.cacheSize');
        if (cavemanDirty) {
          ensureMapInDoc(doc, ['caveman']);
          if (dirtyFields.has('caveman.enabled')) {
            setBooleanInDoc(doc, ['caveman', 'enabled'], values.caveman.enabled);
          }
          if (dirtyFields.has('caveman.level')) {
            setStringInDoc(doc, ['caveman', 'level'], values.caveman.level);
          }
          if (dirtyFields.has('caveman.cacheSize')) {
            setStringInDoc(doc, ['caveman', 'cache-size'], values.caveman.cacheSize);
          }
          deleteIfMapEmpty(doc, ['caveman']);
        }

        if (hasPayloadDirtyFields(dirtyFields)) {
          ensureMapInDoc(doc, ['payload']);
          if (dirtyFields.has('payloadDefaultRules')) {
            if (values.payloadDefaultRules.length > 0) {
              doc.setIn(
                ['payload', 'default'],
                serializePayloadRulesForYaml(values.payloadDefaultRules)
              );
            } else if (docHas(doc, ['payload', 'default'])) {
              doc.deleteIn(['payload', 'default']);
            }
          }
          if (dirtyFields.has('payloadDefaultRawRules')) {
            if (values.payloadDefaultRawRules.length > 0) {
              doc.setIn(
                ['payload', 'default-raw'],
                serializeRawPayloadRulesForYaml(values.payloadDefaultRawRules)
              );
            } else if (docHas(doc, ['payload', 'default-raw'])) {
              doc.deleteIn(['payload', 'default-raw']);
            }
          }
          if (dirtyFields.has('payloadOverrideRules')) {
            if (values.payloadOverrideRules.length > 0) {
              doc.setIn(
                ['payload', 'override'],
                serializePayloadRulesForYaml(values.payloadOverrideRules)
              );
            } else if (docHas(doc, ['payload', 'override'])) {
              doc.deleteIn(['payload', 'override']);
            }
          }
          if (dirtyFields.has('payloadOverrideRawRules')) {
            if (values.payloadOverrideRawRules.length > 0) {
              doc.setIn(
                ['payload', 'override-raw'],
                serializeRawPayloadRulesForYaml(values.payloadOverrideRawRules)
              );
            } else if (docHas(doc, ['payload', 'override-raw'])) {
              doc.deleteIn(['payload', 'override-raw']);
            }
          }
          if (dirtyFields.has('payloadFilterRules')) {
            if (values.payloadFilterRules.length > 0) {
              doc.setIn(
                ['payload', 'filter'],
                serializePayloadFilterRulesForYaml(values.payloadFilterRules)
              );
            } else if (docHas(doc, ['payload', 'filter'])) {
              doc.deleteIn(['payload', 'filter']);
            }
          }
          deleteIfMapEmpty(doc, ['payload']);
        }

        return doc.toString({ indent: 2, lineWidth: 120, minContentWidth: 0 });
      } catch {
        return currentYaml;
      }
    },
    [dirtyFields, visualValues]
  );

  const setVisualValues = useCallback((newValues: Partial<VisualConfigValues>) => {
    dispatch({ type: 'set_values', values: newValues });
  }, []);

  return {
    visualValues,
    visualDirty,
    visualDirtyFields: dirtyFields,
    visualParseError,
    visualValidationErrors,
    visualHasPayloadValidationErrors,
    loadVisualValuesFromYaml,
    applyVisualChangesToYaml,
    setVisualValues,
  };
}

export const VISUAL_CONFIG_PROTOCOL_OPTIONS = [
  {
    value: '',
    labelKey: 'config_management.visual.payload_rules.provider_default',
    defaultLabel: 'Default',
  },
  {
    value: 'openai',
    labelKey: 'config_management.visual.payload_rules.provider_openai',
    defaultLabel: 'OpenAI',
  },
  {
    value: 'openai-response',
    labelKey: 'config_management.visual.payload_rules.provider_openai_response',
    defaultLabel: 'OpenAI Response',
  },
  {
    value: 'gemini',
    labelKey: 'config_management.visual.payload_rules.provider_gemini',
    defaultLabel: 'Gemini',
  },
  {
    value: 'claude',
    labelKey: 'config_management.visual.payload_rules.provider_claude',
    defaultLabel: 'Claude',
  },
  {
    value: 'codex',
    labelKey: 'config_management.visual.payload_rules.provider_codex',
    defaultLabel: 'Codex',
  },
  {
    value: 'antigravity',
    labelKey: 'config_management.visual.payload_rules.provider_antigravity',
    defaultLabel: 'Antigravity',
  },
] as const;

export const VISUAL_CONFIG_PAYLOAD_VALUE_TYPE_OPTIONS = [
  {
    value: 'string',
    labelKey: 'config_management.visual.payload_rules.value_type_string',
    defaultLabel: 'String',
  },
  {
    value: 'number',
    labelKey: 'config_management.visual.payload_rules.value_type_number',
    defaultLabel: 'Number',
  },
  {
    value: 'boolean',
    labelKey: 'config_management.visual.payload_rules.value_type_boolean',
    defaultLabel: 'Boolean',
  },
  {
    value: 'json',
    labelKey: 'config_management.visual.payload_rules.value_type_json',
    defaultLabel: 'JSON',
  },
] as const satisfies ReadonlyArray<{
  value: PayloadParamValueType;
  labelKey: string;
  defaultLabel: string;
}>;
