#!/usr/bin/env bash
# Выкладка статического экспорта на shared-хостинг SpaceWeb по FTP.
#
# SSH на аккаунте отключён (оболочка — nologin), Node на хостинге нет,
# поэтому сайт собирается статикой и заливается файлами.
#
# Пароль берётся только из переменной окружения и никогда не пишется на диск:
#   SW_FTP_PASS='...' ./deploy/upload.sh
set -euo pipefail

HOST="${SW_FTP_HOST:-77.222.40.65}"
USER="${SW_FTP_USER:-adelinasha}"
PASS="${SW_FTP_PASS:?не задан SW_FTP_PASS}"
ROOT="${SW_FTP_ROOT:-public_html}"

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="$here/apps/web/out"

[ -d "$out" ] || { echo "Нет сборки: $out. Сначала STATIC_EXPORT=1 npm run build --workspace=@platform/web"; exit 1; }

base="ftp://$HOST/$ROOT"
cp "$here/deploy/htaccess" "$out/.htaccess"

total=$(cd "$out" && find . -type f | wc -l)
n=0
while IFS= read -r f; do
  rel="${f#./}"
  n=$((n + 1))
  printf '[%3d/%3d] %s\n' "$n" "$total" "$rel"
  # FTP на shared-хостинге изредка отказывает в переходе в каталог. Без
  # повторов заливка обрывалась на середине и на сервере оставалась смесь
  # старой и новой сборки.
  curl -sS --ftp-pasv --ftp-create-dirs --retry 4 --retry-delay 2 --retry-all-errors     -u "$USER:$PASS" -T "$out/$rel" "$base/$rel"
done < <(cd "$out" && find . -type f | sort)

echo "Готово: $n файлов в $ROOT"
